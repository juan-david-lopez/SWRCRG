const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Error en la solicitud');
  }

  return data;
};

export const get  = (endpoint)         => request(endpoint);
export const post = (endpoint, body)   => request(endpoint, { method: 'POST', body: JSON.stringify(body) });
export const put  = (endpoint, body)   => request(endpoint, { method: 'PUT',  body: JSON.stringify(body) });
export const del  = (endpoint)         => request(endpoint, { method: 'DELETE' });
