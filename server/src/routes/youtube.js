const express = require('express');
const { getLatestLosVideo } = require('../services/youtubeService');

const router = express.Router();

router.get('/latest-los-video', async (_req, res) => {
  try {
    const video = await getLatestLosVideo();
    res.json(video);
  } catch (err) {
    console.error('YouTube:', err.message);
    res.status(503).json({
      error: 'Não foi possível carregar o último vídeo da LOS no momento.',
      details: err.message,
    });
  }
});

module.exports = router;
