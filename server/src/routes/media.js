const express = require('express');
const path = require('path');
const fs = require('fs');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const env = require('../config/env');
const { extractS3Key, s3Client, s3Enabled } = require('../services/uploadService');

const router = express.Router();

router.get('/s3', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url || !s3Enabled || !s3Client) {
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }

    const key = extractS3Key(url);
    if (!key) {
      return res.status(400).json({ error: 'URL S3 inválida' });
    }

    const object = await s3Client.send(
      new GetObjectCommand({
        Bucket: env.aws.bucket,
        Key: key,
      })
    );

    res.set('Content-Type', object.ContentType || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    object.Body.pipe(res);
  } catch (err) {
    console.error('Media S3:', err.message);
    res.status(404).json({ error: 'Imagem não disponível' });
  }
});

router.get('/local/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filepath = path.join(__dirname, '../../uploads/players', filename);

  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'Arquivo não encontrado' });
  }

  res.sendFile(filepath);
});

module.exports = router;
