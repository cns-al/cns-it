const BASE_URL = (typeof window !== 'undefined' && (window as any).__BASE_PATH__) || '';

async function request(path: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('cnsit_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['cnsitauth'] = `Bearer ${token}`;
  }
  Object.assign(headers, options.headers || {});

  try {
    const res = await fetch(`${BASE_URL}/api${path}`, {
      ...options,
      headers,
    });

    // Handle 401 - token expired or invalid
    if (res.status === 401) {
      localStorage.removeItem('cnsit_token');
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    // Handle 429 - rate limited
    if (res.status === 429) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Too many requests');
    }

    return res;
  } catch (error) {
    if (error instanceof Error && error.message === 'Session expired') {
      throw error;
    }
    throw new Error('Network error. Please check your connection.');
  }
}

export const api = {
  get: (path: string, opts?: RequestInit) => request(path, { ...opts, method: 'GET' }),
  post: (path: string, body?: unknown, opts?: RequestInit) =>
    request(path, { ...opts, method: 'POST', body: JSON.stringify(body) }),
  put: (path: string, body?: unknown, opts?: RequestInit) =>
    request(path, { ...opts, method: 'PUT', body: JSON.stringify(body) }),
  delete: (path: string, opts?: RequestInit) =>
    request(path, { ...opts, method: 'DELETE' }),
};
