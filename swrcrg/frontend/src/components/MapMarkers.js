import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon   from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix para íconos por defecto de Leaflet con bundlers (Vite/Webpack)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl:       markerIcon,
  shadowUrl:     markerShadow,
});

// Tile URL más estético — CartoDB Positron (minimalista, sin ruido visual)
export const TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
export const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

// Colores por estado
const STATUS_MARKER_COLORS = {
  pendiente:  { fill: '#f59e0b', stroke: '#d97706' },
  en_proceso: { fill: '#3b82f6', stroke: '#2563eb' },
  resuelto:   { fill: '#22c55e', stroke: '#16a34a' },
  default:    { fill: '#94a3b8', stroke: '#64748b' },
};

// Crea un icono SVG circular personalizado según el estado
export const createStatusIcon = (estado = 'default', size = 14) => {
  const { fill, stroke } = STATUS_MARKER_COLORS[estado] || STATUS_MARKER_COLORS.default;
  const total = size + 8;
  const cx = total / 2;
  const r1 = size / 2;
  const r2 = Math.max(r1 - 4, 1);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${total}" viewBox="0 0 ${total} ${total}">
    <circle cx="${cx}" cy="${cx}" r="${r1}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
    <circle cx="${cx}" cy="${cx}" r="${r2}" fill="white" opacity="0.4"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: 'swrcrg-marker',
    iconSize:    [total, total],
    iconAnchor:  [cx, cx],
    popupAnchor: [0, -cx],
  });
};

// Icono para el MapPicker (pin de ubicación)
export const createPickerIcon = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="#2563eb"/>
    <circle cx="14" cy="14" r="6" fill="white"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: 'swrcrg-marker',
    iconSize:    [28, 36],
    iconAnchor:  [14, 36],
    popupAnchor: [0, -36],
  });
};
