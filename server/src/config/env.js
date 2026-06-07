const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envCandidates = [
  path.join(__dirname, '../../../.env'),
  path.join(__dirname, '../../.env'),
  path.join(process.cwd(), '.env'),
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

function trim(value) {
  if (typeof value !== 'string') return value;
  let v = value.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

const dbHost = trim(process.env.DB_HOST) || 'localhost';

module.exports = {
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: trim(process.env.JWT_SECRET) || 'los-cloud-dev-secret',
  db: {
    host: dbHost,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: trim(process.env.DB_USER) || 'root',
    password: trim(process.env.DB_PASSWORD) || '',
    database: trim(process.env.DB_NAME) || 'los_cloud',
    ssl:
      process.env.DB_SSL === 'true' || dbHost.includes('rds.amazonaws.com')
        ? { rejectUnauthorized: false }
        : undefined,
  },
  aws: {
    region: trim(process.env.AWS_REGION) || 'us-east-1',
    bucket: trim(process.env.AWS_S3_BUCKET) || '',
    accessKeyId: trim(process.env.AWS_ACCESS_KEY_ID) || '',
    secretAccessKey: trim(process.env.AWS_SECRET_ACCESS_KEY) || '',
    publicUrl: trim(process.env.AWS_S3_PUBLIC_URL) || '',
  },
  openrouter: {
    apiKey: trim(process.env.OPENROUTER_API_KEY) || '',
    apiUrl: trim(process.env.OPENROUTER_API_URL) || 'https://openrouter.ai/api/v1',
    model:
      trim(process.env.OPENROUTER_MODEL) || 'deepseek/deepseek-chat-v3-0324:free',
  },
  youtube: {
    apiKey: trim(process.env.YOUTUBE_API_KEY) || '',
    channelId: trim(process.env.YOUTUBE_CHANNEL_ID) || '',
    channelHandle: trim(process.env.YOUTUBE_CHANNEL_HANDLE) || 'LOS.LeagueofLegends',
  },
  n8n: {
    webhookUrl: trim(process.env.N8N_WEBHOOK_URL) || '',
  },
};
