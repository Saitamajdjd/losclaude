const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const { analyzeMatch, AI_ERROR_MESSAGE } = require('../services/aiService');
const { validateMatchBody } = require('../utils/matchValidation');

const router = express.Router();

function buildAnalysisPayloadFromRow(match, stats) {
  return {
    modality: match.modality,
    score: match.score,
    result: match.result,
    stats,
    towers_destroyed: match.towers_destroyed ?? 0,
    dragons: match.dragons,
    barons: match.barons ?? 0,
    match_duration: match.match_duration,
    team_placement: match.team_placement,
    booyah: match.booyah,
    team_eliminations: match.team_eliminations ?? 0,
  };
}

async function buildAnalysisPayload(matchId, conn = pool) {
  const [matches] = await conn.query('SELECT * FROM matches WHERE id = ?', [matchId]);
  if (!matches.length) return null;

  const [stats] = await conn.query(
    `SELECT ms.*, p.nick, p.real_name, p.role
     FROM match_stats ms
     JOIN players p ON p.id = ms.player_id
     WHERE ms.match_id = ?`,
    [matchId]
  );

  return buildAnalysisPayloadFromRow(matches[0], stats);
}

router.get('/', async (_req, res) => {
  try {
    const [matches] = await pool.query('SELECT * FROM matches ORDER BY created_at DESC');
    const result = await Promise.all(
      matches.map(async (match) => {
        const [stats] = await pool.query(
          `SELECT ms.*, p.nick, p.real_name, p.role
           FROM match_stats ms
           JOIN players p ON p.id = ms.player_id
           WHERE ms.match_id = ?`,
          [match.id]
        );
        return { ...match, stats };
      })
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar partidas' });
  }
});

router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const matchId = req.params.id;
    const payload = await buildAnalysisPayload(matchId);
    if (!payload) {
      return res.status(404).json({ error: 'Partida não encontrada' });
    }

    let ai_analysis;
    try {
      ai_analysis = await analyzeMatch(payload);
    } catch (aiErr) {
      console.error('IA retry:', aiErr.response?.data || aiErr.message);
      ai_analysis = AI_ERROR_MESSAGE;
    }

    await pool.query('UPDATE matches SET ai_analysis = ? WHERE id = ?', [ai_analysis, matchId]);

    const [matchRows] = await pool.query('SELECT * FROM matches WHERE id = ?', [matchId]);
    const [statRows] = await pool.query(
      `SELECT ms.*, p.nick, p.real_name, p.role
       FROM match_stats ms JOIN players p ON p.id = ms.player_id WHERE ms.match_id = ?`,
      [matchId]
    );

    const updated = { ...matchRows[0], stats: statRows };
    if (ai_analysis === AI_ERROR_MESSAGE) {
      return res.status(502).json({ error: AI_ERROR_MESSAGE, ai_analysis, ...updated });
    }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar análise' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [matches] = await pool.query('SELECT * FROM matches WHERE id = ?', [req.params.id]);
    if (!matches.length) return res.status(404).json({ error: 'Partida não encontrada' });

    const [stats] = await pool.query(
      `SELECT ms.*, p.nick, p.real_name, p.role
       FROM match_stats ms
       JOIN players p ON p.id = ms.player_id
       WHERE ms.match_id = ?`,
      [req.params.id]
    );
    res.json({ ...matches[0], stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar partida' });
  }
});

router.post('/', auth, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const validation = validateMatchBody(req.body);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const { modality } = req.body;
    const strategic = validation.data;
    const { stats } = strategic;
    const isLoL = modality === 'League of Legends';
    const score = isLoL ? req.body.score : `#${strategic.team_placement}`;
    const result = isLoL ? req.body.result : strategic.booyah ? 'Vitória' : 'Derrota';

    await conn.beginTransaction();

    const [matchResult] = await conn.query(
      `INSERT INTO matches (
        modality, score, result,
        towers_destroyed, dragons, barons, match_duration, team_placement, booyah, team_eliminations
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        modality,
        score,
        result,
        strategic.towers_destroyed,
        strategic.dragons,
        strategic.barons,
        strategic.match_duration,
        strategic.team_placement || null,
        strategic.booyah,
        strategic.team_eliminations,
      ]
    );
    const matchId = matchResult.insertId;

    const statsWithNames = [];
    for (const s of stats) {
      await conn.query(
        `INSERT INTO match_stats (match_id, player_id, kills, deaths, assists, free_fire_kills, free_fire_placement)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          matchId,
          s.player_id,
          s.kills,
          s.deaths,
          s.assists,
          s.free_fire_kills,
          s.free_fire_placement,
        ]
      );
      const [playerRows] = await conn.query('SELECT nick, real_name, role FROM players WHERE id = ?', [
        s.player_id,
      ]);
      statsWithNames.push({
        ...s,
        ...playerRows[0],
      });
    }

    const [matchRows] = await conn.query('SELECT * FROM matches WHERE id = ?', [matchId]);
    const analysisPayload = buildAnalysisPayloadFromRow(matchRows[0], statsWithNames);

    let ai_analysis;
    try {
      ai_analysis = await analyzeMatch(analysisPayload);
    } catch (aiErr) {
      console.error('IA:', aiErr.response?.data || aiErr.message);
      ai_analysis = AI_ERROR_MESSAGE;
    }

    await conn.query('UPDATE matches SET ai_analysis = ? WHERE id = ?', [ai_analysis, matchId]);
    await conn.commit();

    const [finalMatch] = await pool.query('SELECT * FROM matches WHERE id = ?', [matchId]);
    const [statRows] = await pool.query(
      `SELECT ms.*, p.nick, p.real_name, p.role
       FROM match_stats ms JOIN players p ON p.id = ms.player_id WHERE ms.match_id = ?`,
      [matchId]
    );

    res.status(201).json({ ...finalMatch[0], stats: statRows });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar partida' });
  } finally {
    conn.release();
  }
});

module.exports = router;
