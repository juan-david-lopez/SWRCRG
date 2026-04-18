import { post, get, put, patch, del } from './api';

export const register    = (data) => post('/auth/register', data);
export const login       = (data) => post('/auth/login', data);
export const getMe       = ()     => get('/auth/me');
export const updateMe    = (data) => put('/auth/me', data);
export const changePassword = (data) => put('/auth/me/password', data);
export const getUsuarios    = ()     => get('/auth/usuarios');
export const toggleUsuarioActivo = (id) => patch(`/auth/usuarios/${id}/activo`, {});
export const changeUsuarioRol    = (id, rol) => patch(`/auth/usuarios/${id}/rol`, { rol });
