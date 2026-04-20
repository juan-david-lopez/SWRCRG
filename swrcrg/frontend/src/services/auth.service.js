import { post, get, put, patch, del } from './api';

export const register    = (data) => post('/auth/register', data);
export const sendVerificationCode = (correo) => post('/auth/send-verification-code', { correo });
export const login       = (data) => post('/auth/login', data);
export const getMe       = ()     => get('/auth/me');
export const updateMe    = (data) => put('/auth/me', data);
export const changePassword = (data) => put('/auth/me/password', data);
export const getUsuarios    = ()     => get('/auth/usuarios');
export const toggleUsuarioActivo = (id) => patch(`/auth/usuarios/${id}/activo`, {});
export const changeUsuarioRol    = (id, rol) => patch(`/auth/usuarios/${id}/rol`, { rol });
export const completeOnboarding  = ()  => post('/auth/me/onboarding', {});

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const uploadAvatar = (formData) => {
  const token = localStorage.getItem('token');
  return fetch(`${BASE_URL}/auth/me/avatar`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al subir avatar');
    return data;
  });
};
