/**
 * Script para resetear la contraseña de un usuario administrador.
 *
 * USO:
 *   node scripts/resetAdminPassword.js <username> <nueva_password>
 *
 * EJEMPLO:
 *   node scripts/resetAdminPassword.js admin MiNuevaPass123!
 *
 * Si no pasas argumentos, resetea el usuario 'admin' a 'Cambiar123!'.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const logger = require('../config/logger');

async function main() {
  const username = process.argv[2] || 'admin';
  const newPassword = process.argv[3] || 'Cambiar123!';

  if (newPassword.length < 6) {
    console.error('❌ La contraseña debe tener al menos 6 caracteres.');
    process.exit(1);
  }

  try {
    // Verificar que el usuario existe
    const { rows } = await db.query('SELECT id, username FROM usuarios WHERE username = $1', [username]);
    if (rows.length === 0) {
      console.error(`❌ No existe el usuario "${username}"`);
      process.exit(1);
    }

    // Generar nuevo hash
    const hash = await bcrypt.hash(newPassword, 10);

    // Actualizar
    await db.query(
      'UPDATE usuarios SET password = $1 WHERE username = $2',
      [hash, username]
    );

    console.log(`\n✅ Contraseña de "${username}" actualizada correctamente`);
    console.log(`\n📝 Credenciales:`);
    console.log(`   Usuario:     ${username}`);
    console.log(`   Contraseña:  ${newPassword}`);
    console.log(`\n💡 Inicia sesión y cámbiala desde el panel por seguridad.\n`);
    process.exit(0);
  } catch (err) {
    logger.error('Error reseteando contraseña', { message: err.message });
    process.exit(1);
  }
}

main();
