const express = require('express');
const { testOpenRouter } = require('../services/aiService');

const router = express.Router();

router.get('/test', async (_req, res) => {
  try {
    await testOpenRouter();
    res.json({ message: 'OpenRouter funcionando no LOS Cloud' });
  } catch (error) {
    console.error('Erro OpenRouter:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Erro ao conectar com OpenRouter',
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;
