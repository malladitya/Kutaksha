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

/** Turn a thrown request() error into something worth showing a user. */
export function describeApiError(error) {
  if (!error) return 'Something went wrong.';

  if (error.name === 'AbortError') {
    return 'The assistant took too long to respond. Please try again.';
  }

  if (error.status === 401) {
    return 'Your session has expired. Please sign in again.';
  }

  try {
    const parsed = JSON.parse(error.body);
    if (parsed?.detail) {
      return typeof parsed.detail === 'string' ? parsed.detail : JSON.stringify(parsed.detail);
    }
  } catch {
    // Body was not JSON — fall through to the raw message.
  }

  return error.message || 'Something went wrong.';
}

/**
 * Ask the RAG assistant. The LangGraph pipeline can take a while, so this
 * aborts rather than hanging the UI forever.
 */
export async function askRag(query, chatHistory = [], { timeoutMs = 60000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await request('/chat/query', {
      method: 'POST',
      body: JSON.stringify({ query, chat_history: chatHistory }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
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
  askRag,
  describeApiError,
  API_BASE,
};
