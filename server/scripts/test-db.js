require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mysql = require('mysql2/promise');

async function tryConnect(config, label) {
  try {
    const conn = await mysql.createConnection(config);
    await conn.query('SELECT 1');
    await conn.end();
    console.log(`OK [${label}]`);
    return true;
  } catch (err) {
    console.log(`FAIL [${label}]`, err.code, err.message);
    return false;
  }
}

async function main() {
  const host = (process.env.DB_HOST || '').trim();
  const base = {
    host,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: (process.env.DB_USER || '').trim(),
    password: (process.env.DB_PASSWORD || '').trim(),
    ssl: host.includes('rds.amazonaws.com') ? { rejectUnauthorized: false } : undefined,
    connectTimeout: 20000,
  };

  console.log('Host:', host);
  console.log('User:', base.user);
  console.log('Password length:', base.password.length);
  console.log('Database:', (process.env.DB_NAME || '').trim());
  console.log('---');

  const withDb = await tryConnect({ ...base, database: (process.env.DB_NAME || '').trim() }, 'com database');
  if (!withDb) {
    await tryConnect(base, 'sem database (só autenticação)');
  }

  if (!withDb) {
    console.log('\nSe ambos falharem com ER_ACCESS_DENIED_ERROR:');
    console.log('1. No console AWS RDS, confira o "Master username" (pode não ser "admin")');
    console.log('2. Actions → Modify → defina a senha master novamente');
    console.log('3. Aguarde o status "Available" e teste de novo');
    process.exit(1);
  }

  const conn = await mysql.createConnection({ ...base, database: (process.env.DB_NAME || '').trim() });
  const [tables] = await conn.query("SHOW TABLES LIKE 'users'");
  console.log('Tabela users:', tables.length ? 'existe' : 'NÃO existe — reinicie o server para criar');
  await conn.end();
}

main();
