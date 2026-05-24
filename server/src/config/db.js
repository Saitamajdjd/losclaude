const mysql = require('mysql2/promise');
const env = require('./env');

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  ssl: env.db.ssl,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 20000,
  enableKeepAlive: true,
});

let dbReady = false;

function isDbReady() {
  return dbReady;
}

function setDbReady(value) {
  dbReady = value;
}

module.exports = pool;
module.exports.isDbReady = isDbReady;
module.exports.setDbReady = setDbReady;
