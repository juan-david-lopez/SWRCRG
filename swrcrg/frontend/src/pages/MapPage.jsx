import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import { getReports } from '../services/report.service';
import { getCategorias } from '../services/categoria.service';
import { STATUS_COLORS } from '../constants/reportStatus';
import { Search, X, MapPin, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { TILE_URL, TILE_ATTR, createStatusIcon } from '../components/MapMarkers';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const STATUS_LABEL = {
  pendiente:  'Pendiente',
  verificado: 'Verificado',
  en_proceso: 'En proceso',
  resuelto:   'Resuelto',
  rechazado:  'Rechazado',
};

const STATUS_OPTIONS = [
  { value: 'pendiente',  label: 'Pendiente',  color: '#f59e0b' },
  { value: 'verificado', label: 'Verificado', color: '#22c55e' },
  { value: 'en_proceso', label: 'En proceso', color: '#3b82f6' },
  { value: 'resuelto',   label: 'Resuelto',   color: '#16a34a' },
];

const LEGEND_COLORS = {
  pendiente:  '#f59e0b',
  verificado: '#22c55e',
  en_proceso: '#3b82f6',
  resuelto:   '#16a34a',
};

const DEFAULT_CENTER = [4.7110, -74.0721];

// ── Chip de filtro activo ──────────────────────────────────────────────────────
const ActiveChip = ({ label, onRemove }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    padding: '3px 8px 3px 10px', borderRadius: '20px',
    background: '#eff6ff', border: '1px solid #bfdbfe',
    fontSize: '11px', fontWeight: '600', color: '#1d4ed8',
  }}>
    {label}
    <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, color: '#1d4ed8' }}>
      <X size={11} strokeWidth={2.5} />
    </button>
  </span>
);

// ── Sección colapsable ─────────────────────────────────────────────────────────
const Section = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', fontFamily: 'inherit' }}
      >
        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</span>
        {open ? <ChevronUp size={13} color="var(--c-text-3)" /> : <ChevronDown size={13} color="var(--c-text-3)" />}
      </button>
      {open && <div style={{ marginTop: '8px' }}>{children}</div>}
    </div>
  );
};

const MapPage = () => {
  const [reports, setReports]           = useState([]);
  const [categorias, setCategorias]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeStatuses, setActiveStatuses] = useState(new Set()); // vacío = todos
  const [activeCats, setActiveCats]     = useState(new Set());     // vacío = todas
  const [search, setSearch]             = useState('');
  const navigate                        = useNavigate();

  useEffect(() => {
    Promise.all([
      getReports({ limit: 200 }),
      getCategorias(),
    ])
      .then(([data, catData]) => {
        setReports(data.reportes ?? []);
        setCategorias(catData.categorias ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Toggle estado
  const toggleStatus = (val) => {
    setActiveStatuses((prev) => {
      const next = new Set(prev);
      next.has(val) ? next.delete(val) : next.add(val);
      return next;
    });
  };

  // Toggle categoría
  const toggleCat = (id) => {
    setActiveCats((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const clearAll = () => {
    setActiveStatuses(new Set());
    setActiveCats(new Set());
    setSearch('');
  };

  const hasFilters = activeStatuses.size > 0 || activeCats.size > 0 || search;

  const filtered = useMemo(() => reports.filter((r) => {
    const matchStatus = activeStatuses.size === 0 || activeStatuses.has(r.estado?.nombre);
    const matchCat    = activeCats.size === 0    || activeCats.has(r.categoria?.id);
    const matchSearch = !search || r.titulo?.toLowerCase().includes(search.toLowerCase()) || r.direccion_referencia?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchCat && matchSearch;
  }), [reports, activeStatuses, activeCats, search]);

  const center = filtered.length > 0
    ? [
        filtered.reduce((s, r) => s + parseFloat(r.latitud), 0) / filtered.length,
        filtered.reduce((s, r) => s + parseFloat(r.longitud), 0) / filtered.length,
      ]
    : DEFAULT_CENTER;

  // Chips de filtros activos
  const activeChips = [
    ...Array.from(activeStatuses).map((v) => ({
      key: `s-${v}`,
      label: STATUS_LABEL[v] || v,
      onRemove: () => toggleStatus(v),
    })),
    ...Array.from(activeCats).map((id) => {
      const cat = categorias.find((c) => c.id === id);
      return {
        key: `c-${id}`,
        label: cat?.nombre?.replace(/_/g, ' ') || id,
        onRemove: () => toggleCat(id),
      };
    }),
  ];

  return (
    <div style={s.page}>
      {/* ── Sidebar ── */}
      <div style={s.sidebar}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={s.sideTitle}>Mapa de reportes</h2>
            <p style={s.sideCount}>
              {filtered.length} de {reports.length} reporte(s)
            </p>
          </div>
          {hasFilters && (
            <button onClick={clearAll} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#2563eb', fontWeight: '600', fontFamily: 'inherit', padding: '4px 0' }}>
              Limpiar
            </button>
          )}
        </div>

        {/* Búsqueda */}
        <div style={s.searchWrap}>
          <Search size={14} color="var(--c-text-3)" style={{ flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título o dirección..."
            style={s.searchInput}
          />
          {search && (
            <button onClick={() => setSearch('')} style={s.clearBtn}>
              <X size={13} color="var(--c-text-3)" />
            </button>
          )}
        </div>

        {/* Chips de filtros activos */}
        {activeChips.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {activeChips.map((chip) => (
              <ActiveChip key={chip.key} label={chip.label} onRemove={chip.onRemove} />
            ))}
          </div>
        )}

        {/* Filtro por estado */}
        <Section title="Estado">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {STATUS_OPTIONS.map((o) => {
              const active = activeStatuses.has(o.value);
              const count  = reports.filter((r) => r.estado?.nombre === o.value).length;
              return (
                <button
                  key={o.value}
                  onClick={() => toggleStatus(o.value)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '7px 10px', borderRadius: '8px', border: `1px solid ${active ? o.color : 'var(--c-border)'}`,
                    background: active ? o.color + '18' : 'var(--c-bg)',
                    cursor: 'pointer', fontFamily: 'inherit', gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: o.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', fontWeight: active ? '600' : '400', color: active ? o.color : 'var(--c-text)' }}>
                      {o.label}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--c-text-3)', background: 'var(--c-border)', padding: '1px 6px', borderRadius: '10px' }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Filtro por categoría */}
        {categorias.length > 0 && (
          <Section title="Categoría" defaultOpen={false}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {categorias.map((cat) => {
                const active = activeCats.has(cat.id);
                const count  = reports.filter((r) => r.categoria?.id === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCat(cat.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '6px 10px', borderRadius: '8px',
                      border: `1px solid ${active ? '#7c3aed' : 'var(--c-border)'}`,
                      background: active ? '#ede9fe' : 'var(--c-bg)',
                      cursor: 'pointer', fontFamily: 'inherit', gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: active ? '600' : '400', color: active ? '#7c3aed' : 'var(--c-text)', textTransform: 'capitalize', textAlign: 'left' }}>
                      {cat.nombre.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--c-text-3)', background: 'var(--c-border)', padding: '1px 6px', borderRadius: '10px', flexShrink: 0 }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* Lista de reportes filtrados */}
        <Section title={`Resultados (${filtered.length})`} defaultOpen={true}>
          <div style={s.reportList}>
            {loading && <p style={s.loadingText}>Cargando...</p>}
            {!loading && filtered.length === 0 && (
              <p style={s.loadingText}>Sin resultados{hasFilters ? ' con estos filtros' : ''}</p>
            )}
            {filtered.map((r) => {
              const badge = STATUS_COLORS[r.estado?.nombre] || {};
              return (
                <Link key={r.id} to={`/reports/${r.id}`} style={s.reportItem}>
                  <div style={s.reportItemTop}>
                    <span style={s.reportItemTitle}>{r.titulo}</span>
                    <span style={{ ...s.badge, ...badge }}>
                      {STATUS_LABEL[r.estado?.nombre] ?? r.estado?.nombre}
                    </span>
                  </div>
                  {r.categoria && (
                    <span style={s.reportItemCat}>{r.categoria.nombre.replace(/_/g, ' ')}</span>
                  )}
                  {r.direccion_referencia && (
                    <span style={{ fontSize: '11px', color: 'var(--c-text-3)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <MapPin size={10} strokeWidth={2} /> {r.direccion_referencia}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </Section>
      </div>

      {/* ── Mapa ── */}
      <div style={s.mapWrap}>
        {!loading && (
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%', minHeight: '400px' }}
            scrollWheelZoom
          >
            <TileLayer url={TILE_URL} attribution={TILE_ATTR} />
            {filtered.map((r) => {
              const img = r.imagenes?.[0]?.url_imagen;
              return (
                <Marker
                  key={r.id}
                  position={[parseFloat(r.latitud), parseFloat(r.longitud)]}
                  icon={createStatusIcon(r.estado?.nombre, 16)}
                  eventHandlers={{ click: () => navigate(`/reports/${r.id}`) }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1} className="swrcrg-tooltip">
                    <div style={tp.wrap}>
                      {img && (
                        <div style={tp.imgWrap}>
                          <img src={`${API_BASE}${img}`} alt={r.titulo} style={tp.img} />
                        </div>
                      )}
                      <div style={tp.body}>
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

        {/* Contador flotante sobre el mapa */}
        {!loading && hasFilters && (
          <div style={{
            position: 'absolute', top: '12px', right: '12px', zIndex: 1000,
            background: 'var(--c-surface)', borderRadius: '8px', padding: '6px 12px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)', border: '1px solid var(--c-border)',
            fontSize: '12px', fontWeight: '600', color: 'var(--c-text)',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          }}>
            <Filter size={12} strokeWidth={2} color="#2563eb" />
            {filtered.length} de {reports.length} visibles
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Estilos del tooltip ── */
const tp = {
  wrap:    { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", minWidth: '200px', maxWidth: '240px', padding: 0, overflow: 'hidden', whiteSpace: 'normal', wordBreak: 'break-word' },
  imgWrap: { width: '100%', height: '110px', overflow: 'hidden' },
  img:     { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  body:    { padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '5px' },
  badge:   { fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', alignSelf: 'flex-start', textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap' },
  title:   { margin: 0, fontSize: '13px', fontWeight: '700', color: '#0f172a', lineHeight: '1.4', whiteSpace: 'normal', wordBreak: 'break-word' },
  cat:     { fontSize: '11px', color: '#7c3aed', background: '#ede9fe', padding: '2px 8px', borderRadius: '20px', alignSelf: 'flex-start' },
  dir:     { margin: 0, fontSize: '11px', color: '#64748b', whiteSpace: 'normal', wordBreak: 'break-word' },
  hint:    { margin: 0, fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' },
};

const s = {
  page:           { display: 'flex', height: 'calc(100vh - 57px)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", overflow: 'hidden' },
  sidebar:        { width: '280px', flexShrink: 0, background: 'var(--c-surface)', borderRight: '1px solid var(--c-border)', display: 'flex', flexDirection: 'column', padding: '16px', gap: '14px', overflowY: 'auto' },
  sideTitle:      { margin: '0 0 2px', fontSize: '17px', fontWeight: '800', color: 'var(--c-text)' },
  sideCount:      { margin: 0, fontSize: '12px', color: 'var(--c-text-3)' },
  searchWrap:     { display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--c-border)', borderRadius: '8px', padding: '8px 12px', background: 'var(--c-bg)' },
  searchInput:    { flex: 1, border: 'none', outline: 'none', fontSize: '13px', color: 'var(--c-text)', background: 'transparent', fontFamily: 'inherit' },
  clearBtn:       { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 },
  reportList:     { display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' },
  loadingText:    { fontSize: '13px', color: 'var(--c-text-3)', textAlign: 'center', marginTop: '8px' },
  reportItem:     { display: 'flex', flexDirection: 'column', gap: '4px', padding: '9px 10px', borderRadius: '8px', border: '1px solid var(--c-bg)', textDecoration: 'none', color: 'inherit', background: 'var(--c-bg)' },
  reportItemTop:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' },
  reportItemTitle:{ fontSize: '12px', fontWeight: '600', color: 'var(--c-text)', lineHeight: '1.3' },
  badge:          { fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.3px' },
  reportItemCat:  { fontSize: '11px', color: '#7c3aed', background: '#ede9fe', padding: '2px 8px', borderRadius: '20px', alignSelf: 'flex-start' },
  mapWrap:        { flex: 1, position: 'relative', height: '100%' },
};

export default MapPage;
