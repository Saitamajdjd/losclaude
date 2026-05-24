const env = require('../config/env');

const CACHE_TTL_MS = 15 * 60 * 1000;
let cache = { data: null, expiresAt: 0 };
let resolvedChannelId = null;

function decodeXml(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'LOS-Cloud/1.0' },
  });
  if (!response.ok) {
    throw new Error(`YouTube fetch failed: ${response.status}`);
  }
  return response.text();
}

async function resolveChannelId() {
  if (env.youtube.channelId) return env.youtube.channelId;
  if (resolvedChannelId) return resolvedChannelId;

  const handle = env.youtube.channelHandle.replace(/^@/, '');
  const pageUrl = `https://www.youtube.com/@${handle}`;
  const html = await fetchText(pageUrl);
  const match =
    html.match(/"channelId":"(UC[\w-]{20,})"/) ||
    html.match(/"externalId":"(UC[\w-]{20,})"/) ||
    html.match(/(UC[\w-]{22})/);

  if (!match) {
    throw new Error('Não foi possível obter o ID do canal YouTube. Configure YOUTUBE_CHANNEL_ID no .env');
  }

  resolvedChannelId = match[1];
  return resolvedChannelId;
}

function parseLatestFromRss(xml) {
  const entryBlock = xml.match(/<entry>([\s\S]*?)<\/entry>/);
  if (!entryBlock) {
    throw new Error('Nenhum vídeo encontrado no feed do canal');
  }

  const entry = entryBlock[1];
  const videoId =
    entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ||
    entry.match(/watch\?v=([\w-]{11})/)?.[1];
  const title = decodeXml(entry.match(/<title>([^<]*)<\/title>/)?.[1]?.trim() || 'Vídeo da LOS');
  const publishedAt = entry.match(/<published>([^<]+)<\/published>/)?.[1] || null;

  if (!videoId) {
    throw new Error('ID do vídeo não encontrado no RSS');
  }

  return {
    videoId,
    title,
    publishedAt,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

async function fetchLatestViaApi(channelId) {
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('key', env.youtube.apiKey);
  url.searchParams.set('channelId', channelId);
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('order', 'date');
  url.searchParams.set('maxResults', '1');
  url.searchParams.set('type', 'video');

  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'YouTube Data API error');
  }

  const item = data.items?.[0];
  if (!item) throw new Error('Nenhum vídeo retornado pela API');

  const videoId = item.id?.videoId;
  const title = item.snippet?.title || 'Vídeo da LOS';
  const publishedAt = item.snippet?.publishedAt || null;

  return {
    videoId,
    title,
    publishedAt,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

async function fetchLatestViaRss(channelId) {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const xml = await fetchText(rssUrl);
  return parseLatestFromRss(xml);
}

async function getLatestLosVideo() {
  const now = Date.now();
  if (cache.data && cache.expiresAt > now) {
    return cache.data;
  }

  const channelId = await resolveChannelId();
  const video = env.youtube.apiKey
    ? await fetchLatestViaApi(channelId)
    : await fetchLatestViaRss(channelId);

  cache = { data: video, expiresAt: now + CACHE_TTL_MS };
  return video;
}

module.exports = { getLatestLosVideo };
