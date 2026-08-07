const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function buildHeaders(customHeaders = {}) {
  const token = localStorage.getItem('kutaksha_token');
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: buildHeaders(options.headers),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    const error = new Error(`API request failed (${response.status}): ${response.statusText}`);
    error.status = response.status;
    error.body = errorBody;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function loginToBackend(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function registerToBackend(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getProfile() {
  return request('/auth/profile');
}

export async function logoutBackend() {
  return request('/auth/logout', {
    method: 'POST',
  });
}

export { API_BASE };
export default {
  loginToBackend,
  registerToBackend,
  getProfile,
  logoutBackend,
  API_BASE,
};
