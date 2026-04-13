import { get } from './api';

// El backend expone categorías a través de los reportes; las obtenemos del seeder
// Fallback estático alineado con el seeder por si no hay endpoint dedicado
export const getCategorias = async () => {
  try {
    return await get('/categorias');
  } catch {
    return {
      categorias: [
        { id: null, nombre: 'basura_domestica',    label: 'Basura doméstica' },
        { id: null, nombre: 'escombros',           label: 'Escombros' },
        { id: null, nombre: 'reciclaje',           label: 'Reciclaje' },
        { id: null, nombre: 'poda',                label: 'Poda' },
        { id: null, nombre: 'residuos_peligrosos', label: 'Residuos peligrosos' },
        { id: null, nombre: 'animales_muertos',    label: 'Animales muertos' },
        { id: null, nombre: 'otro',                label: 'Otro' },
      ],
    };
  }
};
