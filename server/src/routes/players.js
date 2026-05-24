const express = require('express');
const multer = require('multer');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const { uploadImage } = require('../services/uploadService');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM players ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar jogadores' });
  }
});

router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { real_name, nick, role, modality, description } = req.body;
    if (!real_name || !nick || !role || !modality) {
      return res.status(400).json({ error: 'Campos obrigatórios: nome, nick, função e modalidade' });
    }

    let image_url = null;
    if (req.file) {
      image_url = await uploadImage(req.file);
    }

    const [result] = await pool.query(
      `INSERT INTO players (real_name, nick, role, modality, image_url, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [real_name, nick, role, modality, image_url, description || null]
    );

    const [rows] = await pool.query('SELECT * FROM players WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao cadastrar jogador' });
  }
});

router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const { real_name, nick, role, modality, description } = req.body;
    if (!real_name || !nick || !role || !modality) {
      return res.status(400).json({ error: 'Campos obrigatórios: nome, nick, função e modalidade' });
    }

    const [existing] = await pool.query('SELECT * FROM players WHERE id = ?', [req.params.id]);
    if (!existing.length) {
      return res.status(404).json({ error: 'Jogador não encontrado' });
    }

    let image_url = existing[0].image_url;
    if (req.file) {
      image_url = await uploadImage(req.file);
    }

    await pool.query(
      `UPDATE players SET real_name = ?, nick = ?, role = ?, modality = ?, image_url = ?, description = ?
       WHERE id = ?`,
      [real_name, nick, role, modality, image_url, description || null, req.params.id]
    );

    const [rows] = await pool.query('SELECT * FROM players WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar jogador' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM players WHERE id = ?', [req.params.id]);
    res.json({ message: 'Jogador removido' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover jogador' });
  }
});

module.exports = router;
