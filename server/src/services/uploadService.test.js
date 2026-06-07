const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const Module = require('node:module');

const SERVICE_PATH = require.resolve('./uploadService');
const ENV_PATH = require.resolve('../config/env');
const AWS_ENV_KEYS = [
  'AWS_REGION',
  'AWS_S3_BUCKET',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_S3_PUBLIC_URL',
];

function resetModules() {
  delete require.cache[SERVICE_PATH];
  delete require.cache[ENV_PATH];
}

function withEnv(values) {
  const original = new Map(AWS_ENV_KEYS.map((key) => [key, process.env[key]]));

  for (const key of AWS_ENV_KEYS) {
    if (Object.prototype.hasOwnProperty.call(values, key)) {
      if (values[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = values[key];
      }
    }
  }

  return () => {
    for (const [key, value] of original.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    resetModules();
  };
}

function withRandomUuid(value) {
  const original = crypto.randomUUID;
  crypto.randomUUID = () => value;

  return () => {
    crypto.randomUUID = original;
  };
}

function loadUploadServiceWithS3Mock(sendImpl = async () => ({})) {
  const commands = [];
  const clients = [];

  class PutObjectCommand {
    constructor(input) {
      this.input = input;
    }
  }

  class S3Client {
    constructor(config) {
      this.config = config;
      clients.push(this);
    }

    send(command) {
      commands.push(command);
      return sendImpl(command);
    }
  }

  const originalLoad = Module._load;
  Module._load = function load(request, parent, isMain) {
    if (request === '@aws-sdk/client-s3') {
      return { S3Client, PutObjectCommand };
    }
    return originalLoad.call(this, request, parent, isMain);
  };

  try {
    resetModules();
    return {
      service: require('./uploadService'),
      commands,
      clients,
    };
  } finally {
    Module._load = originalLoad;
  }
}

function cleanupUpload(service, filename) {
  fs.rmSync(path.join(service.UPLOAD_DIR, filename), { force: true });
}

test('returns a public S3 URL after successful upload', async () => {
  const restoreEnv = withEnv({
    AWS_REGION: 'sa-east-1',
    AWS_S3_BUCKET: 'los-bucket',
    AWS_ACCESS_KEY_ID: 'access-key',
    AWS_SECRET_ACCESS_KEY: 'secret-key',
    AWS_S3_PUBLIC_URL: '',
  });
  const restoreUuid = withRandomUuid('s3-id');
  let service;

  try {
    const loaded = loadUploadServiceWithS3Mock();
    service = loaded.service;

    const url = await service.uploadImage({
      originalname: 'player photo.webp',
      mimetype: 'image/webp',
      buffer: Buffer.from('image'),
    });

    assert.equal(url, 'https://los-bucket.s3.sa-east-1.amazonaws.com/uploads/players/s3-id-player_photo.webp');
    assert.equal(loaded.commands.length, 1);
    assert.equal(loaded.commands[0].input.Bucket, 'los-bucket');
    assert.equal(loaded.commands[0].input.Key, 'uploads/players/s3-id-player_photo.webp');
    assert.equal(loaded.commands[0].input.ContentType, 'image/webp');
  } finally {
    if (service) cleanupUpload(service, 's3-id-player_photo.webp');
    restoreUuid();
    restoreEnv();
  }
});

test('uses AWS_S3_PUBLIC_URL when configured', async () => {
  const restoreEnv = withEnv({
    AWS_REGION: 'us-east-1',
    AWS_S3_BUCKET: 'los-bucket',
    AWS_ACCESS_KEY_ID: 'access-key',
    AWS_SECRET_ACCESS_KEY: 'secret-key',
    AWS_S3_PUBLIC_URL: 'https://cdn.example.com/media/',
  });
  const restoreUuid = withRandomUuid('custom-id');
  let service;

  try {
    const loaded = loadUploadServiceWithS3Mock();
    service = loaded.service;

    const url = await service.uploadImage({
      originalname: 'photo.png',
      mimetype: 'image/png',
      buffer: Buffer.from('image'),
    });

    assert.equal(url, 'https://cdn.example.com/media/uploads/players/custom-id-photo.png');
    assert.equal(loaded.commands[0].input.Key, 'uploads/players/custom-id-photo.png');
  } finally {
    if (service) cleanupUpload(service, 'custom-id-photo.png');
    restoreUuid();
    restoreEnv();
  }
});

test('keeps the local uploads URL as fallback when S3 is disabled', async () => {
  const restoreEnv = withEnv({
    AWS_REGION: 'us-east-1',
    AWS_S3_BUCKET: '',
    AWS_ACCESS_KEY_ID: '',
    AWS_SECRET_ACCESS_KEY: '',
    AWS_S3_PUBLIC_URL: '',
  });
  const restoreUuid = withRandomUuid('local-id');
  let service;

  try {
    const loaded = loadUploadServiceWithS3Mock();
    service = loaded.service;

    const url = await service.uploadImage({
      originalname: 'photo.png',
      mimetype: 'image/png',
      buffer: Buffer.from('image'),
    });

    assert.equal(url, '/uploads/players/local-id-photo.png');
    assert.equal(loaded.commands.length, 0);
  } finally {
    if (service) cleanupUpload(service, 'local-id-photo.png');
    restoreUuid();
    restoreEnv();
  }
});
