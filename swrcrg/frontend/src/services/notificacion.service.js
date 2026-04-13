import { get, patch } from './api';

export const getNotificaciones    = ()   => get('/notificaciones');
export const marcarLeida          = (id) => patch(`/notificaciones/${id}/leer`);
export const marcarTodasLeidas    = ()   => patch('/notificaciones/leer-todas');
