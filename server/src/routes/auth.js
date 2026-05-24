const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { isDbReady } = require('../config/db');
const env = require('../config/env');
const { getDbErrorMessage } = require('../utils/dbErrors');

const router = express.Router();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function dbUnavailable(res) {
  return res.status(503).json({
    error: 'Banco de dados indisponível. Verifique a conexão com o MySQL/RDS.',
  });
}

router.post('/register', async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);

  try {
    const name = String(req.body.name || '').trim();
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios' });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Informe um e-mail válido' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }

    const password_hash = await bcrypt.hash(String(password), 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, password_hash]
    );

    const user = { id: result.insertId, name, email };
    const token = jwt.sign({ id: user.id, email: user.email }, env.jwtSecret, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user,
      message: 'Cadastro realizado com sucesso!',
    });
  } catch (err) {
    console.error('Register error:', err.code, err.message);
    res.status(500).json({ error: getDbErrorMessage(err) });
  }
});

router.post('/login', async (req, res) => {
  if (!isDbReady()) return dbUnavailable(res);

  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(String(password), user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, env.jwtSecret, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
      message: 'Login realizado com sucesso!',
    });
  } catch (err) {
    console.error('Login error:', err.code, err.message);
    res.status(500).json({ error: getDbErrorMessage(err) });
  }
});

module.exports = router;
