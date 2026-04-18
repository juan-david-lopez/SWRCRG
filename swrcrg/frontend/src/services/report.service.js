import { get, put, post, del } from './api';

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
export const addComment         = (id, comentario)       => post(`/reportes/${id}/comentarios`, { comentario });
export const deleteComment      = (reporteId, comentId)  => del(`/reportes/${reporteId}/comentarios/${comentId}`);
export const editReport         = (id, data)             => put(`/reportes/${id}`, data);
export const deleteReport       = (id)                   => del(`/reportes/${id}`);

export const uploadReportImage = (id, formData) => {
  const token = localStorage.getItem('token');
  return fetch(`${BASE_URL}/reportes/${id}/imagenes`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al subir imagen');
    return data;
  });
};

export const voteReport         = (id)           => post(`/reportes/${id}/votar`, {});
export const getNearbyReports   = (lat, lng, radio = 0.5) => get(`/reportes/cercanos?lat=${lat}&lng=${lng}&radio=${radio}`);
export const exportReportsCSV   = () => {
  const token = localStorage.getItem('token');
  return fetch(`${BASE_URL}/reportes/exportar/csv`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).then(async (res) => {
    if (!res.ok) throw new Error('Error al exportar');
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `reportes-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });
};
