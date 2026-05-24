require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

async function main() {
  const pool = require('../src/config/db');
  const { initDatabase } = require('../src/config/initDb');

  const ok = await initDatabase();
  if (!ok) process.exit(1);

  const [cols] = await pool.query('SHOW COLUMNS FROM matches');
  console.log('Colunas matches:', cols.map((c) => c.Field).join(', '));

  await pool.end();
  console.log('Migração de partidas OK');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
