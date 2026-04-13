import { get, put } from './api';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Crea un reporte con FormData (multipart para imagen opcional)
export const createReportForm = (formData) => {
  const token = localStorage.getItem('token');
  return fetch(`${BASE_URL}/reportes`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al crear el reporte');
    return data;
  });
};

export const getReports         = ()                    => get('/reportes');
export const getReport          = (id)                  => get(`/reportes/${id}`);
export const getMyReports       = ()                    => get('/reportes/me/reportes');
export const getReportsByCategory = (catId)             => get(`/reportes/categoria/${catId}`);
export const updateReportStatus = (id, estado, observacion) =>
  put(`/reportes/${id}/estado`, { estado, observacion });
export const getReportHistory   = (id)                  => get(`/reportes/${id}/historial`);
export const getReportComments  = (id)                  => get(`/reportes/${id}/comentarios`);
