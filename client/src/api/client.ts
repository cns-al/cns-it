const BASE_URL = (typeof window !== 'undefined' && (window as any).__BASE_PATH__) || '';

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('cnsit_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['cnsitauth'] = `Bearer ${token}`;
  }
  Object.assign(headers, options.headers || {});

  const res = await fetch(`${BASE_URL}/api${path}`, {
    ...options,
    headers,
  });
  return res;
}

export const api = {
  get: (path: string, opts?: RequestInit) => request(path, { ...opts, method: 'GET' }),
  post: (path: string, body?: any, opts?: RequestInit) =>
    request(path, { ...opts, method: 'POST', body: JSON.stringify(body) }),
  put: (path: string, body?: any, opts?: RequestInit) =>
    request(path, { ...opts, method: 'PUT', body: JSON.stringify(body) }),
  delete: (path: string, opts?: RequestInit) =>
    request(path, { ...opts, method: 'DELETE' }),
};
