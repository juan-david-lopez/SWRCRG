import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import { getReports } from '../services/report.service';
import { STATUS_COLORS } from '../constants/reportStatus';
import { Search, X } from 'lucide-react';
import { TILE_URL, TILE_ATTR, createStatusIcon } from '../components/MapMarkers';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const STATUS_LABEL = { pendiente: 'Pendiente', en_proceso: 'En proceso', resuelto: 'Resuelto' };
const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'pendiente',  label: 'Pendiente' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'resuelto',   label: 'Resuelto' },
];

const DEFAULT_CENTER = [4.7110, -74.0721];

const MapPage = () => {
  const [reports, setReports]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch]             = useState('');
  const navigate                        = useNavigate();

  useEffect(() => {
    getReports()
      .then(({ reportes }) => setReports(reportes ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = reports.filter((r) => {
    const matchStatus = !filterStatus || r.estado?.nombre === filterStatus;
    const matchSearch = !search || r.titulo?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const center = filtered.length > 0
    ? [
        filtered.reduce((s, r) => s + parseFloat(r.latitud), 0) / filtered.length,
        filtered.reduce((s, r) => s + parseFloat(r.longitud), 0) / filtered.length,
      ]
    : DEFAULT_CENTER;

  return (
    <div style={s.page}>
      {/* Sidebar */}
      <div style={s.sidebar}>
        <h2 style={s.sideTitle}>Mapa de reportes</h2>
        <p style={s.sideCount}>{filtered.length} reporte(s) visibles</p>

        <div style={s.searchWrap}>
          <Search size={14} color="var(--c-text-3)" style={{ flexShrink: 0 }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." style={s.searchInput} />
          {search && <button onClick={() => setSearch('')} style={s.clearBtn}><X size={13} color="var(--c-text-3)" /></button>}
        </div>

        <div style={s.filterGroup}>
          {STATUS_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setFilterStatus(o.value)}
              style={{ ...s.filterBtn, ...(filterStatus === o.value ? s.filterBtnActive : {}) }}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Leyenda */}
        <div style={s.legend}>
          {[
            { label: 'Pendiente',  color: '#f59e0b' },
            { label: 'En proceso', color: '#3b82f6' },
            { label: 'Resuelto',   color: '#22c55e' },
          ].map(({ label, color }) => (
            <div key={label} style={s.legendItem}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={s.legendLabel}>{label}</span>
            </div>
          ))}
        </div>

        <div style={s.reportList}>
          {loading && <p style={s.loadingText}>Cargando...</p>}
          {!loading && filtered.length === 0 && <p style={s.loadingText}>Sin resultados</p>}
          {filtered.map((r) => {
            const badge = STATUS_COLORS[r.estado?.nombre] || {};
            return (
              <Link key={r.id} to={`/reports/${r.id}`} style={s.reportItem}>
                <div style={s.reportItemTop}>
                  <span style={s.reportItemTitle}>{r.titulo}</span>
                  <span style={{ ...s.badge, ...badge }}>{STATUS_LABEL[r.estado?.nombre] ?? r.estado?.nombre}</span>
                </div>
                {r.categoria && <span style={s.reportItemCat}>{r.categoria.nombre.replace(/_/g, ' ')}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Map */}
      <div style={s.mapWrap}>
        {!loading && (
          <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', minHeight: '400px' }} scrollWheelZoom>
            <TileLayer url={TILE_URL} attribution={TILE_ATTR} />
            {filtered.map((r) => {
              const img = r.imagenes?.[0]?.url_imagen;
              return (
                <Marker
                  key={r.id}
                  position={[parseFloat(r.latitud), parseFloat(r.longitud)]}
                  icon={createStatusIcon(r.estado?.nombre, 16)}
                  eventHandlers={{
                    click: () => navigate(`/reports/${r.id}`),
                  }}
                >
                  {/* Tooltip — se muestra al hacer hover */}
                  <Tooltip
                    direction="top"
                    offset={[0, -10]}
                    opacity={1}
                    className="swrcrg-tooltip"
                  >
                    <div style={tp.wrap}>
                      {/* Imagen preview */}
                      {img && (
                        <div style={tp.imgWrap}>
                          <img
                            src={`${API_BASE}${img}`}
                            alt={r.titulo}
                            style={tp.img}
                          />
                        </div>
                      )}
                      <div style={tp.body}>
                        {/* Badge estado */}
                        {r.estado?.nombre && (
                          <span style={{ ...tp.badge, ...STATUS_COLORS[r.estado.nombre] }}>
                            {STATUS_LABEL[r.estado.nombre] ?? r.estado.nombre}
                          </span>
                        )}
                        <p style={tp.title}>{r.titulo}</p>
                        {r.categoria && (
                          <span style={tp.cat}>{r.categoria.nombre.replace(/_/g, ' ')}</span>
                        )}
                        {r.direccion_referencia && (
                          <p style={{ ...tp.dir, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={11} strokeWidth={2} color="#64748b" />
                            {r.direccion_referencia}
                          </p>
                        )}
                        <p style={tp.hint}>Clic para ver detalle</p>
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

/* ── Estilos del tooltip ── */
const tp = {
  wrap:  { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", minWidth: '200px', maxWidth: '240px', padding: 0, overflow: 'hidden' },
  imgWrap:{ width: '100%', height: '110px', overflow: 'hidden' },
  img:   { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  body:  { padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '5px' },
  badge: { fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', alignSelf: 'flex-start', textTransform: 'uppercase', letterSpacing: '0.3px' },
  title: { margin: 0, fontSize: '13px', fontWeight: '700', color: '#0f172a', lineHeight: '1.3' },
  cat:   { fontSize: '11px', color: '#7c3aed', background: '#ede9fe', padding: '2px 8px', borderRadius: '20px', alignSelf: 'flex-start' },
  dir:   { margin: 0, fontSize: '11px', color: '#64748b' },
  hint:  { margin: 0, fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' },
};

const s = {
  page:           { display: 'flex', height: 'calc(100vh - 57px)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", overflow: 'hidden' },
  sidebar:        { width: '300px', flexShrink: 0, background: 'var(--c-surface)', borderRight: '1px solid var(--c-border)', display: 'flex', flexDirection: 'column', padding: '20px 16px', gap: '12px', overflowY: 'auto' },
  sideTitle:      { margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--c-text)' },
  sideCount:      { margin: 0, fontSize: '13px', color: 'var(--c-text-3)' },
  searchWrap:     { display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--c-border)', borderRadius: '8px', padding: '8px 12px', background: 'var(--c-bg)' },
  searchInput:    { flex: 1, border: 'none', outline: 'none', fontSize: '13px', color: 'var(--c-text)', background: 'transparent', fontFamily: 'inherit' },
  clearBtn:       { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 },
  filterGroup:    { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  filterBtn:      { padding: '5px 12px', borderRadius: '20px', border: '1px solid var(--c-border)', background: 'var(--c-surface)', fontSize: '12px', fontWeight: '600', color: 'var(--c-text-2)', cursor: 'pointer', fontFamily: 'inherit' },
  filterBtnActive:{ background: '#2563eb', color: '#fff', border: '1px solid #2563eb' },
  reportList:     { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' },
  loadingText:    { fontSize: '13px', color: 'var(--c-text-3)', textAlign: 'center', marginTop: '20px' },
  reportItem:     { display: 'flex', flexDirection: 'column', gap: '4px', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--c-bg)', textDecoration: 'none', color: 'inherit', background: 'var(--c-bg)' },
  reportItemTop:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' },
  reportItemTitle:{ fontSize: '13px', fontWeight: '600', color: 'var(--c-text)', lineHeight: '1.3' },
  badge:          { fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.3px' },
  reportItemCat:  { fontSize: '11px', color: '#7c3aed', background: '#ede9fe', padding: '2px 8px', borderRadius: '20px', alignSelf: 'flex-start' },
  mapWrap:        { flex: 1, position: 'relative', height: '100%' },
  legend:         { display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px 12px', background: 'var(--c-bg)', borderRadius: '8px' },
  legendItem:     { display: 'flex', alignItems: 'center', gap: '8px' },
  legendLabel:    { fontSize: '12px', color: 'var(--c-text-2)', fontWeight: '500' },
};

export default MapPage;
