const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function resolveImageUrl(url) {
  if (!url) return null;

  if (url.startsWith('http') && url.includes('.amazonaws.com')) {
    return `${API_BASE}/media/s3?url=${encodeURIComponent(url)}`;
  }

  if (url.startsWith('http')) return url;

  if (url.startsWith('/uploads')) return url;

  return url;
}
