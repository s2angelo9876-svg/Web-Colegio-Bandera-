<?php
declare(strict_types=1);

const FUT_DOCUMENT_SLUG = 'fut';

const PHOTO_MIB = 10;
const PDF_MIB = 15;

function upload(string $kind): ?array
{
    $file = $_FILES['media'] ?? null;
    if (!$file || ($file['error'] ?? null) === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    $error = $file['error'] ?? null;
    if (in_array($error, [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)) {
        fail(413, 'El archivo supera el tamaño permitido.', 'media');
    }
    if ($error !== UPLOAD_ERR_OK || !is_string($file['tmp_name'] ?? null) || !is_uploaded_file($file['tmp_name'])) {
        fail(422, 'No se pudo recibir el archivo. Selecciónalo de nuevo.', 'media');
    }
    $path = $file['tmp_name'];
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($path);
    $limit = $mime === 'application/pdf' ? PDF_MIB : PHOTO_MIB;
    $size = filesize($path);
    if ($size === false || $size > $limit * 1024 * 1024) {
        fail(413, "El archivo admite hasta $limit MiB.", 'media');
    }
    if ($mime === 'application/pdf' && in_array($kind, ['document','pdf'], true)) {
        verifyPdf($path);
        $data = file_get_contents($path);
        if ($data === false) {
            fail(422, 'No se pudo leer el PDF.', 'media');
        }
        return [$mime,'archivo.pdf',bin2hex($data),null,null,null];
    }
    if ($kind === 'pdf' || !in_array($mime, ['image/jpeg','image/png','image/webp'], true)) {
        fail(415, 'Formato de archivo no admitido.', 'media');
    }
    return processImage($path, $mime);
}

function verifyPdf(string $path): void
{
    // Array arguments avoid a shell. The parser runs with bounded wall time and memory.
    $proc = proc_open(
        ['timeout','--kill-after=1s','8s','prlimit','--as=268435456','--','qpdf','--suppress-recovery','--check',$path],
        [0=>['file','/dev/null','r'],1=>['file','/dev/null','w'],2=>['file','/dev/null','w']],
        $pipes
    );
    if (!is_resource($proc) || proc_close($proc) !== 0) {
        fail(422, 'El PDF debe ser legible, consistente y estar libre de contraseña.', 'media');
    }
}

function processImage(string $path, string $mime): array
{
    $size = @getimagesize($path);
    if (!$size || $size[0] < 1 || $size[1] < 1 || $size[0] * $size[1] > 12000000 || $size['mime'] !== $mime) {
        fail(422, 'La imagen debe ser válida y tener hasta 12 megapíxeles.', 'media');
    }
    $image = match ($mime) {
        'image/jpeg' => @imagecreatefromjpeg($path),
        'image/png' => @imagecreatefrompng($path),
        'image/webp' => @imagecreatefromwebp($path),
    };
    if (!$image) {
        fail(422, 'No se pudo decodificar la imagen.', 'media');
    }
    if ($mime === 'image/jpeg') {
        $metadata = @exif_read_data($path);
        $orientation = (int) ($metadata['Orientation'] ?? 1);
        if (in_array($orientation, [2,4,5,7], true)) {
            imageflip($image, in_array($orientation, [2,5,7], true) ? IMG_FLIP_HORIZONTAL : IMG_FLIP_VERTICAL);
        }
        $angle = match ($orientation) {3 => 180, 5,8 => 90, 6,7 => -90, default => 0};
        if ($angle !== 0) {
            $rotated = imagerotate($image, $angle, 0);
            if (!$rotated) {
                fail(422, 'No se pudo orientar la imagen.', 'media');
            }
            $image = $rotated;
        }
    }
    if (!imageistruecolor($image)) {
        imagepalettetotruecolor($image);
    }
    imagealphablending($image, false);
    imagesavealpha($image, true);

    $full = scaledImage($image, 1600);
    $width = imagesx($full);
    $height = imagesy($full);
    $large = webp($full, 84);
    $small = webp(scaledImage($full, 640), 78);
    return ['image/webp','imagen.webp',bin2hex($large),$width,$height,bin2hex($small)];
}

function scaledImage(GdImage $image, int $maximum): GdImage
{
    $width = imagesx($image);
    $height = imagesy($image);
    $longest = max($width,$height);
    if ($longest <= $maximum) {
        return $image;
    }
    $scaled = imagescale($image, max(1,(int) round($width*$maximum/$longest)), max(1,(int) round($height*$maximum/$longest)), IMG_BICUBIC_FIXED);
    if (!$scaled) {
        fail(422, 'No se pudo reducir la imagen.', 'media');
    }
    imagesavealpha($scaled, true);
    return $scaled;
}

function webp(GdImage $image, int $quality): string
{
    ob_start();
    $ok = imagewebp($image, null, $quality);
    $bytes = ob_get_clean();
    if (!$ok || !$bytes) {
        fail(422, 'No se pudo normalizar la imagen.', 'media');
    }
    return $bytes;
}

function mediaInfo(int $id): array
{
    return query('SELECT mime,width,height,thumbnail IS NOT NULL AS has_thumbnail,octet_length(bytes) AS size_bytes
                  FROM media WHERE id=?', [$id])->fetch(PDO::FETCH_ASSOC) ?: [];
}

function serveMedia(int $id, ?int $revision, array $session, bool $thumbnail): never
{
    if ($revision !== null) {
        $module = query('SELECT c.module FROM revisions r JOIN content c ON c.id=r.content_id WHERE r.id=?', [$revision])->fetchColumn();
        if (!$module || !allowed($session, $module, 'preview')) {
            fail(404, 'Archivo no encontrado.');
        }
        header('X-Robots-Tag: noindex, nofollow');
    }
    $constraint = $revision === null ? '(' . visibleRevision() . ')=rm.revision_id AND c.deleted_at IS NULL' : 'rm.revision_id=?';
    $payload = $thumbnail ? 'coalesce(m.thumbnail,m.bytes)' : 'm.bytes';
    $etag = $revision === null ? ",encode(sha256($payload),'hex') AS etag" : '';
    $media = query("SELECT m.mime,m.filename,$payload AS payload$etag FROM media m WHERE m.id=? AND EXISTS (
                    SELECT 1 FROM revision_media rm JOIN revisions r ON r.id=rm.revision_id
                    JOIN content c ON c.id=r.content_id WHERE rm.media_id=m.id AND $constraint)",
        $revision === null ? [$id] : [$id,$revision])->fetch(PDO::FETCH_ASSOC);
    if (!$media) {
        if ($revision === null && !$thumbnail) {
            $slug = query("SELECT DISTINCT c.slug FROM media m JOIN revision_media rm ON rm.media_id=m.id
                    JOIN revisions r ON r.id=rm.revision_id JOIN content c ON c.id=r.content_id
                    WHERE m.id=? AND m.mime='application/pdf' AND c.module='documentos'
                    AND c.deleted_at IS NULL AND (" . visibleRevision() . ") IS NOT NULL AND EXISTS (
                      SELECT 1 FROM editorial_events e WHERE e.revision_id=r.id AND e.action IN ('publish','publish-due')
                    ) LIMIT 2", [$id])->fetchAll(PDO::FETCH_COLUMN);
            if (count($slug) === 1) {
                redirect('/documentos/' . rawurlencode($slug[0]) . '/descargar', 301);
            }
        }
        fail(404, 'Archivo no encontrado.');
    }
    sendMedia($media);
}

function publishedDocumentMedia(string $slug): ?array
{
    $sql = "SELECT m.mime,m.filename,m.bytes AS payload,encode(sha256(m.bytes),'hex') AS etag FROM content c
            JOIN revision_media rm ON rm.revision_id=(" . visibleRevision() . ")
            JOIN media m ON rm.media_id=m.id
            WHERE c.module='documentos' AND c.deleted_at IS NULL AND m.mime='application/pdf'";
    $media = query($sql . ' AND c.slug=?', [$slug])->fetch(PDO::FETCH_ASSOC);
    if (!$media && ctype_digit($slug) && strlen($slug) <= 18) {
        $media = query($sql . ' AND c.id=?', [$slug])->fetch(PDO::FETCH_ASSOC);
    }
    return $media ?: null;
}

function downloadDocument(string $slug): never
{
    $media = publishedDocumentMedia($slug);
    if ($media === null) {
        fail(404, 'Documento no disponible.');
    }
    sendMedia($media);
}

function downloadFut(): never
{
    $media = publishedDocumentMedia(FUT_DOCUMENT_SLUG);
    if ($media !== null) {
        sendMedia($media, 'fut-solicitud.pdf');
    }
    $path = dirname(__DIR__) . '/public/forms/fut-referencial.pdf';
    if (!is_readable($path) || !($stream = fopen($path, 'rb'))) {
        fail(503, 'El formulario no está disponible temporalmente.');
    }
    sendMedia(['mime'=>'application/pdf', 'payload'=>$stream, 'etag'=>hash_file('sha256', $path) ?: null], 'fut-solicitud-referencial.pdf');
}

function sendMedia(array $media, string $pdfFilename = 'archivo.pdf'): never
{
    header('Content-Type: ' . $media['mime']);
    if ($media['mime'] === 'application/pdf') {
        header('Content-Disposition: attachment; filename="' . $pdfFilename . '"');
    }
    if (isset($media['etag']) && revalidatePublic(hash('sha256', $media['etag'] . '|' . $media['mime'] . '|' . $pdfFilename))) {
        exit;
    }
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'HEAD') {
        if (is_resource($media['payload'])) {
            fpassthru($media['payload']);
        } else {
            echo $media['payload'];
        }
    }
    exit;
}
