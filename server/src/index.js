const express = require('express');
const cors = require('cors');
const path = require('path');
const env = require('./config/env');
const { corsOptions } = require('./config/cors');
const { logOpenRouterConfig } = require('./services/aiService');
const { initDatabase } = require('./config/initDb');
const pool = require('./config/db');
const { isDbReady } = require('./config/db');

const authRoutes = require('./routes/auth');
const playerRoutes = require('./routes/players');
const matchRoutes = require('./routes/matches');
const contactRoutes = require('./routes/contact');
const mediaRoutes = require('./routes/media');
const aiRoutes = require('./routes/ai');
const youtubeRoutes = require('./routes/youtube');

const app = express();

app.use(
  cors(corsOptions)
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'LOS Cloud API', database: isDbReady() ? 'connected' : 'disconnected' });
});

app.get('/api/health/db', async (_req, res) => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    const [tables] = await conn.query("SHOW TABLES LIKE 'users'");
    conn.release();
    res.json({ status: 'ok', usersTable: tables.length > 0 });
  } catch (err) {
    res.status(503).json({ status: 'error', message: err.message, code: err.code });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/youtube', youtubeRoutes);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) next();
  });
});

async function start() {
  await initDatabase();
  app.listen(env.port, () => {
    console.log(`LOS Cloud API rodando na porta ${env.port}`);
    console.log(`Banco: ${isDbReady() ? 'conectado' : 'desconectado — auth não funcionará até corrigir o MySQL'}`);
    logOpenRouterConfig();
  });
}

start();

module.exports = app;
