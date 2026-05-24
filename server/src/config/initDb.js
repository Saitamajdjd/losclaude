const pool = require('./db');
const { setDbReady } = require('./db');

const USERS_TABLE = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

async function migrateUsersTable(conn) {
  const [cols] = await conn.query('SHOW COLUMNS FROM users');
  const fields = new Set(cols.map((c) => c.Field));

  if (fields.has('username') && !fields.has('name')) {
    await conn.query(
      'ALTER TABLE users CHANGE COLUMN username name VARCHAR(120) NOT NULL'
    );
    console.log('MySQL: coluna username renomeada para name');
  }

  if (fields.has('password') && !fields.has('password_hash')) {
    await conn.query(
      'ALTER TABLE users CHANGE COLUMN password password_hash VARCHAR(255) NOT NULL'
    );
    console.log('MySQL: coluna password renomeada para password_hash');
  }
}

async function migrateMatchesTable(conn) {
  const [tables] = await conn.query("SHOW TABLES LIKE 'matches'");
  if (tables.length === 0) return;

  const [cols] = await conn.query('SHOW COLUMNS FROM matches');
  const fields = new Set(cols.map((c) => c.Field));

  const additions = [
    ['towers_destroyed', 'INT DEFAULT 0'],
    ['dragons', 'TEXT NULL'],
    ['barons', 'INT DEFAULT 0'],
    ['match_duration', 'VARCHAR(20) NULL'],
    ['team_placement', 'INT DEFAULT NULL'],
    ['booyah', 'BOOLEAN DEFAULT FALSE'],
    ['team_eliminations', 'INT DEFAULT 0'],
  ];

  for (const [name, definition] of additions) {
    if (!fields.has(name)) {
      await conn.query(`ALTER TABLE matches ADD COLUMN ${name} ${definition}`);
      console.log(`MySQL: coluna matches.${name} adicionada`);
    }
  }
}

async function initDatabase() {
  try {
    const conn = await pool.getConnection();

    const [tables] = await conn.query("SHOW TABLES LIKE 'users'");
    if (tables.length === 0) {
      await conn.query(USERS_TABLE);
      console.log('MySQL: tabela users criada');
    } else {
      await migrateUsersTable(conn);
    }

    await migrateMatchesTable(conn);

    conn.release();
    setDbReady(true);
    console.log('MySQL: conexão OK — tabela users verificada');
    return true;
  } catch (err) {
    setDbReady(false);
    console.error('MySQL: falha na conexão ou inicialização —', err.code || err.message);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Dica: confira DB_USER, DB_PASSWORD e permissões do usuário no RDS.');
    }
    if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('Dica: crie o banco los_cloud no RDS e execute database/schema.sql');
    }
    return false;
  }
}

module.exports = { initDatabase };
