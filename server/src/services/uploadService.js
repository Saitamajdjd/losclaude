const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const env = require('../config/env');

const UPLOAD_DIR = path.join(__dirname, '../../uploads/players');

const s3Enabled = Boolean(env.aws.bucket && env.aws.accessKeyId && env.aws.secretAccessKey);

const s3Client = s3Enabled
  ? new S3Client({
      region: env.aws.region,
      credentials: {
        accessKeyId: env.aws.accessKeyId,
        secretAccessKey: env.aws.secretAccessKey,
      },
    })
  : null;

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

function sanitizeFilename(name) {
  return String(name).replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function uploadImage(file) {
  ensureUploadDir();

  const filename = `${crypto.randomUUID()}-${sanitizeFilename(file.originalname || 'photo.jpg')}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  fs.writeFileSync(filepath, file.buffer);

  const localUrl = `/uploads/players/${filename}`;

  if (s3Enabled && s3Client) {
    const key = `players/${filename}`;
    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: env.aws.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype || 'image/jpeg',
        })
      );
      console.log('S3: imagem enviada —', key);
    } catch (err) {
      console.error('S3: falha no upload, usando armazenamento local —', err.message);
    }
  }

  return localUrl;
}

function isS3Url(url) {
  return url && url.includes('.amazonaws.com/');
}

function extractS3Key(url) {
  if (!isS3Url(url)) return null;
  try {
    const parsed = new URL(url);
    return decodeURIComponent(parsed.pathname.slice(1));
  } catch {
    return url.split('.amazonaws.com/')[1] || null;
  }
}

module.exports = { uploadImage, isS3Url, extractS3Key, s3Client, s3Enabled, UPLOAD_DIR };
