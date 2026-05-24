require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

async function main() {
  const { initDatabase } = require('../src/config/initDb');
  const pool = require('../src/config/db');

  const ok = await initDatabase();
  if (!ok) process.exit(1);

  const [cols] = await pool.query('SHOW COLUMNS FROM users');
  console.log('Colunas:', cols.map((c) => c.Field).join(', '));

  await pool.end();
  console.log('Migração/conexão OK');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
