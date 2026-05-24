const API_URL = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('los_token');
}

async function request(endpoint, options = {}) {
  const headers = { ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.body && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  let res;
  try {
    res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  } catch {
    throw new Error('Não foi possível conectar à API. Verifique se o servidor está rodando na porta 5000.');
  }

  let data = {};
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error('Resposta inválida do servidor');
  }

  if (!res.ok) {
    const details =
      typeof data.details === 'string'
        ? data.details
        : data.details?.message || data.details?.error?.message;
    throw new Error(details || data.message || data.error || `Erro na requisição (${res.status})`);
  }

  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  getPlayers: () => request('/players'),
  createPlayer: (formData) => request('/players', { method: 'POST', body: formData }),
  updatePlayer: (id, formData) => request(`/players/${id}`, { method: 'PUT', body: formData }),
  deletePlayer: (id) => request(`/players/${id}`, { method: 'DELETE' }),
  getMatches: () => request('/matches'),
  createMatch: (body) => request('/matches', { method: 'POST', body }),
  retryMatchAnalysis: (id) => request(`/matches/${id}/analyze`, { method: 'POST' }),
  getLatestLosVideo: () => request('/youtube/latest-los-video'),
  contactTeam: (body) => request('/contact/team', { method: 'POST', body }),
};
