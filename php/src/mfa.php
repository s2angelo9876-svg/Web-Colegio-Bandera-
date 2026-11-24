<?php
declare(strict_types=1);

function mfaKey(): string
{
    $secretFile = getenv('COLEGIO_MFA_KEY_FILE');
    $key = $secretFile
        ? (is_readable($secretFile) ? rtrim((string) file_get_contents($secretFile), "\r\n") : '')
        : (getenv('COLEGIO_MFA_KEY') ?: '');
    if (!preg_match('/^[a-f0-9]{64}$/iD', $key)) {
        fail(503, 'Configura la clave de cifrado para la verificación en dos pasos.');
    }
    return hex2bin($key);
}

function protectMfaSecret(string $secret, int $accountId): string
{
    $nonce = random_bytes(SODIUM_CRYPTO_AEAD_XCHACHA20POLY1305_IETF_NPUBBYTES);
    return bin2hex($nonce . sodium_crypto_aead_xchacha20poly1305_ietf_encrypt($secret, (string) $accountId, $nonce, mfaKey()));
}

function openMfaSecret(string $encrypted, int $accountId): string
{
    $bytes = hex2bin($encrypted);
    $size = SODIUM_CRYPTO_AEAD_XCHACHA20POLY1305_IETF_NPUBBYTES;
    $secret = sodium_crypto_aead_xchacha20poly1305_ietf_decrypt(substr($bytes, $size), (string) $accountId,
        substr($bytes, 0, $size), mfaKey());
    if ($secret === false) {
        fail(503, 'La verificación en dos pasos no está disponible.');
    }
    return $secret;
}

function mfaBase32(string $secret): string
{
    $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $bits = implode('', array_map(static fn(string $byte) => str_pad(decbin(ord($byte)), 8, '0', STR_PAD_LEFT), str_split($secret)));
    return implode('', array_map(static fn(string $chunk) => $alphabet[bindec(str_pad($chunk, 5, '0'))], str_split($bits, 5)));
}

function mfaCode(string $secret, int $step): string
{
    $hash = hash_hmac('sha1', pack('J', $step), $secret, true);
    $offset = ord($hash[19]) & 15;
    $number = unpack('N', substr($hash, $offset, 4))[1] & 0x7fffffff;
    return str_pad((string) ($number % 1000000), 6, '0', STR_PAD_LEFT);
}

function mfaMatchingStep(string $secret, string $code, int $time): ?int
{
    if (!preg_match('/^[0-9]{6}$/D', $code)) {
        return null;
    }
    $step = intdiv($time, 30);
    foreach ([$step, $step - 1, $step + 1] as $candidate) {
        if ($candidate >= 0 && hash_equals(mfaCode($secret, $candidate), $code)) {
            return $candidate;
        }
    }
    return null;
}

function enrollMfa(string $name): void
{
    $account = query('SELECT id,username,generation FROM accounts WHERE username=? AND enabled', [$name])->fetch(PDO::FETCH_ASSOC);
    if (!$account) {
        fail(404, 'Cuenta activa no encontrada.');
    }
    $id = (int) $account['id'];
    $secret = random_bytes(20);
    $encrypted = protectMfaSecret($secret, $id);
    fwrite(STDOUT, "Agrega la cuenta {$account['username']} a tu app de autenticación. Usa TOTP, SHA-1, 6 dígitos y 30 segundos.\n"
        . 'Clave de configuración: ' . mfaBase32($secret) . "\nCódigo actual: ");
    $step = mfaMatchingStep($secret, trim((string) fgets(STDIN)), time());
    if ($step === null) {
        fail(422, 'Código inválido o vencido. Repite la configuración.');
    }
    if (!query('UPDATE accounts SET mfa_secret=?,mfa_last_step=?,generation=generation+1 WHERE id=? AND generation=? AND enabled',
        [$encrypted,$step,$id,$account['generation']])->rowCount()) {
        fail(409, 'La cuenta cambió durante la configuración. Repite el proceso.');
    }
    logEvent('account_mfa_configured', ['account_id'=>$id]);
    fwrite(STDOUT, "Verificación activada. Usa un código nuevo al ingresar.\n");
}
