import { get, post, put } from './api';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const createReport     = (data)     => post('/reports', data);
export const createReportForm = (formData) => {
  const token = localStorage.getItem('token');
  return fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al crear el reporte');
    return data;
  });
};
export const getReports         = ()           => get('/reports');
export const getReport          = (id)         => get(`/reports/${id}`);
export const updateReportStatus = (id, status) => put(`/reports/${id}/status`, { status });
