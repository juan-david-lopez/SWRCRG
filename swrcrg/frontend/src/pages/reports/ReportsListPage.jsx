import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, X, Calendar, ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';
import ReportCard from '../../components/ReportCard';
import { ReportCardSkeleton } from '../../components/Skeleton';
import Select from '../../components/Select';
import { getReports } from '../../services/report.service';
import { getCategorias } from '../../services/categoria.service';
import { useAuth } from '../../context/AuthContext';

const PAGE_SIZE = 6;

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'pendiente',  label: 'Pendiente' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'resuelto',   label: 'Resuelto' },
];

// Calcula el inicio de la semana actual (lunes)
const startOfWeek = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
};

const startOfMonth = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  return d;
};

const DATE_PRESETS = [
  { value: '',        label: 'Cualquier fecha' },
  { value: 'today',   label: 'Hoy' },
  { value: 'week',    label: 'Esta semana' },
  { value: 'month',   label: 'Este mes' },
  { value: 'custom',  label: 'Personalizado...' },
];

// Componente de filtro de fecha con picker personalizado
const DateFilter = ({ value, onChange, dateFrom, dateTo, onDateFromChange, onDateToChange }) => {
  const [open, setOpen]   = useState(false);
  const [pos, setPos]     = useState({ top: 0, left: 0 });
  const btnRef            = useRef(null);
  const panelRef          = useRef(null);

  const selectedLabel = DATE_PRESETS.find((p) => p.value === value)?.label ?? 'Fecha';
  const isActive = value !== '';

  const handleOpen = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX });
    }
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (btnRef.current?.contains(e.target) || panelRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handlePreset = (preset) => {
    onChange(preset);
    if (preset !== 'custom') setOpen(false);
  };

  const panel = open && createPortal(
    <div
      ref={panelRef}
      style={{
        position: 'absolute', top: pos.top, left: pos.left,
        background: 'var(--c-surface)', border: '1px solid var(--c-border)',
        borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        zIndex: 9999, minWidth: '220px', overflow: 'hidden',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        animation: 'slideUp .12s ease',
      }}
    >
      {/* Presets */}
      <div style={{ padding: '6px' }}>
        {DATE_PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => handlePreset(p.value)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '9px 12px', borderRadius: '8px',
              border: 'none', background: value === p.value ? 'var(--c-primary-bg)' : 'transparent',
              color: value === p.value ? '#2563eb' : 'var(--c-text)',
              fontSize: '13px', fontWeight: value === p.value ? '600' : '400',
              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
            }}
          >
            {p.label}
            {value === p.value && <span style={{ fontSize: '11px', color: '#2563eb' }}>✓</span>}
          </button>
        ))}
      </div>

      {/* Rango personalizado */}
      {value === 'custom' && (
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--c-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Desde
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              max={dateTo || undefined}
              style={{
                border: '1px solid var(--c-border)', borderRadius: '8px',
                padding: '8px 10px', fontSize: '13px', color: 'var(--c-text)',
                background: 'var(--c-bg)', fontFamily: 'inherit', outline: 'none',
                colorScheme: 'light dark',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Hasta
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              min={dateFrom || undefined}
              style={{
                border: '1px solid var(--c-border)', borderRadius: '8px',
                padding: '8px 10px', fontSize: '13px', color: 'var(--c-text)',
                background: 'var(--c-bg)', fontFamily: 'inherit', outline: 'none',
                colorScheme: 'light dark',
              }}
            />
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              padding: '9px', background: '#2563eb', color: '#fff', border: 'none',
              borderRadius: '8px', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Aplicar
          </button>
        </div>
      )}
    </div>,
    document.body
  );

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '9px 12px', borderRadius: '8px',
          border: `1px solid ${isActive ? '#2563eb' : 'var(--c-border)'}`,
          background: isActive ? 'var(--c-primary-bg)' : 'var(--c-surface)',
          color: isActive ? '#2563eb' : 'var(--c-text)',
          fontSize: '13px', fontWeight: isActive ? '600' : '400',
          cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
        }}
      >
        <Calendar size={14} strokeWidth={2} />
        {selectedLabel}
        <ChevronDown
          size={13} strokeWidth={2} color={isActive ? '#2563eb' : 'var(--c-text-3)'}
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}
        />
      </button>
      {panel}
    </>
  );
};

// ── Main page ──────────────────────────────────────────────────────────────────
const ReportsListPage = () => {
  const { user }                        = useAuth();
  const navigate                        = useNavigate();
  const [reports, setReports]           = useState([]);
  const [categorias, setCategorias]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCat, setFilterCat]       = useState('');
  const [filterDate, setFilterDate]     = useState('');   // preset
  const [dateFrom, setDateFrom]         = useState('');   // YYYY-MM-DD
  const [dateTo, setDateTo]             = useState('');   // YYYY-MM-DD
  const [page, setPage]                 = useState(1);
  const [sortBy, setSortBy]             = useState('fecha');

  useEffect(() => {
    Promise.all([getReports(sortBy === 'votos' ? 'votos' : 'fecha'), getCategorias()])
      .then(([{ reportes }, { categorias }]) => { setReports(reportes); setCategorias(categorias); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sortBy]);

  useEffect(() => { setPage(1); }, [search, filterStatus, filterCat, filterDate, dateFrom, dateTo, sortBy]);

  // Calcula el rango de fechas según el preset activo
  const dateRange = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    if (filterDate === 'today') {
      const from = new Date(); from.setHours(0, 0, 0, 0);
      return { from, to: now };
    }
    if (filterDate === 'week')  return { from: startOfWeek(), to: now };
    if (filterDate === 'month') return { from: startOfMonth(), to: now };
    if (filterDate === 'custom' && (dateFrom || dateTo)) {
      return {
        from: dateFrom ? new Date(dateFrom + 'T00:00:00') : null,
        to:   dateTo   ? new Date(dateTo   + 'T23:59:59') : null,
      };
    }
    return null;
  }, [filterDate, dateFrom, dateTo]);

  const filtered = useMemo(() => {
    const base = reports.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        r.titulo?.toLowerCase().includes(q) ||
        r.descripcion?.toLowerCase().includes(q) ||
        r.direccion_referencia?.toLowerCase().includes(q);
      const matchStatus = !filterStatus || r.estado?.nombre === filterStatus;
      const matchCat    = !filterCat    || r.categoria?.id === filterCat;

      let matchDate = true;
      if (dateRange) {
        const fecha = new Date(r.fecha_reporte ?? r.created_at);
        if (dateRange.from && fecha < dateRange.from) matchDate = false;
        if (dateRange.to   && fecha > dateRange.to)   matchDate = false;
      }

      return matchSearch && matchStatus && matchCat && matchDate;
    });

    if (sortBy === 'estado') return [...base].sort((a, b) => (a.estado?.nombre ?? '').localeCompare(b.estado?.nombre ?? ''));
    return base;
  }, [reports, search, filterStatus, filterCat, dateRange, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = () => {
    setSearch(''); setFilterStatus(''); setFilterCat('');
    setFilterDate(''); setDateFrom(''); setDateTo('');
  };
  const hasFilters = search || filterStatus || filterCat || filterDate;

  // Etiqueta del rango activo para el contador
  const dateLabel = useMemo(() => {
    if (!filterDate) return '';
    if (filterDate === 'custom') {
      if (dateFrom && dateTo) return ` · ${dateFrom} → ${dateTo}`;
      if (dateFrom) return ` · desde ${dateFrom}`;
      if (dateTo)   return ` · hasta ${dateTo}`;
      return '';
    }
    return ` · ${DATE_PRESETS.find((p) => p.value === filterDate)?.label ?? ''}`;
  }, [filterDate, dateFrom, dateTo]);

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* header */}
        <div style={s.header}>
          <h1 style={s.title}>Reportes ciudadanos</h1>
          <p style={s.subtitle}>Monitoreo en tiempo real de la infraestructura y servicios de nuestra comunidad.</p>
        </div>

        {/* filters — fila 1 */}
        <div style={s.filters}>
          <div style={s.searchWrap}>
            <Search size={15} color="var(--c-text-3)" style={{ flexShrink: 0 }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, descripción o dirección..."
              style={s.searchInput}
            />
            {search && (
              <button onClick={() => setSearch('')} style={s.clearBtn}>
                <X size={14} color="var(--c-text-3)" />
              </button>
            )}
          </div>

          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            options={STATUS_OPTIONS}
            placeholder="Todos los estados"
          />

          <Select
            value={filterCat}
            onChange={setFilterCat}
            options={[
              { value: '', label: 'Todas las categorías' },
              ...categorias
                .map((c) => ({ value: c.id, label: c.nombre.replace(/_/g, ' ').toUpperCase() }))
                .sort((a, b) => {
                  if (a.label === 'OTRO') return 1;
                  if (b.label === 'OTRO') return -1;
                  return a.label.localeCompare(b.label);
                }),
            ]}
            placeholder="Todas las categorías"
          />
        </div>

        {/* filters — fila 2 */}
        <div style={{ ...s.filters, marginBottom: '12px' }}>
          <DateFilter
            value={filterDate}
            onChange={setFilterDate}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
          />

          {hasFilters && (
            <button onClick={clearFilters} style={s.clearAllBtn}>
              <X size={13} strokeWidth={2.5} />
              Limpiar filtros
            </button>
          )}

          <Select
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'fecha',  label: 'Más recientes' },
              { value: 'votos',  label: 'Más votados' },
              { value: 'estado', label: 'Por estado' },
            ]}
            style={{ marginLeft: 'auto' }}
          />
        </div>

        {/* results count */}
        {!loading && !error && (
          <p style={s.resultsCount}>
            {filtered.length} reporte{filtered.length !== 1 ? 's' : ''}
            {hasFilters ? ' encontrados' : ' en total'}
            {dateLabel && <span style={{ color: '#2563eb', fontWeight: '600' }}>{dateLabel}</span>}
          </p>
        )}

        {/* content */}
        {loading && (
          <div style={s.list}>
            {Array.from({ length: 4 }).map((_, i) => <ReportCardSkeleton key={i} />)}
          </div>
        )}
        {error && <p style={{ ...s.center, color: '#dc2626' }}>{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <div style={s.emptyWrap}>
            <p style={s.empty}>No se encontraron reportes{hasFilters ? ' con esos filtros' : ''}.</p>
            {hasFilters && (
              <button onClick={clearFilters} style={s.clearAllBtn}>Limpiar filtros</button>
            )}
          </div>
        )}

        {!loading && !error && paginated.length > 0 && (
          <div style={s.list}>
            {paginated.map((r) => <ReportCard key={r.id} report={r} />)}
          </div>
        )}

        {/* pagination */}
        {!loading && !error && totalPages > 1 && (
          <div style={s.pagination}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ ...s.pageBtn, opacity: page === 1 ? 0.4 : 1 }}
            >
              ← Anterior
            </button>
            <div style={s.pageNumbers}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  style={{ ...s.pageNum, ...(n === page ? s.pageNumActive : {}) }}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ ...s.pageBtn, opacity: page === totalPages ? 0.4 : 1 }}
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>

      {user && (
        <button style={s.fab} onClick={() => navigate('/reports/create')} title="Crear reporte">
          <Plus size={22} strokeWidth={2.5} color="#fff" />
        </button>
      )}
    </div>
  );
};

const s = {
  page:         { minHeight: '100vh', background: 'var(--c-bg)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", position: 'relative', paddingBottom: '80px' },
  container:    { maxWidth: '720px', margin: '0 auto', padding: '40px 20px' },
  header:       { marginBottom: '24px' },
  title:        { fontSize: '28px', fontWeight: '800', color: 'var(--c-text)', margin: '0 0 6px' },
  subtitle:     { fontSize: '15px', color: 'var(--c-text-2)', margin: 0 },
  filters:      { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' },
  searchWrap:   { display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 220px', border: '1px solid var(--c-border)', borderRadius: '8px', padding: '9px 12px', background: 'var(--c-surface)' },
  searchInput:  { flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: 'var(--c-text)', background: 'transparent', fontFamily: 'inherit' },
  clearBtn:     { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 },
  clearAllBtn:  { display: 'flex', alignItems: 'center', gap: '5px', padding: '9px 14px', borderRadius: '8px', border: '1px solid var(--c-border)', background: 'var(--c-surface)', fontSize: '13px', fontWeight: '600', color: 'var(--c-text-2)', cursor: 'pointer', fontFamily: 'inherit' },
  resultsCount: { fontSize: '13px', color: 'var(--c-text-3)', margin: '0 0 20px' },
  list:         { display: 'flex', flexDirection: 'column', gap: '20px' },
  center:       { textAlign: 'center', marginTop: '80px', color: 'var(--c-text-3)' },
  emptyWrap:    { textAlign: 'center', marginTop: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  empty:        { color: 'var(--c-text-3)', fontSize: '15px', margin: 0 },
  pagination:   { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '40px', flexWrap: 'wrap' },
  pageBtn:      { padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--c-border)', background: 'var(--c-surface)', fontSize: '13px', fontWeight: '600', color: 'var(--c-text)', cursor: 'pointer', fontFamily: 'inherit' },
  pageNumbers:  { display: 'flex', gap: '4px' },
  pageNum:      { width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--c-border)', background: 'var(--c-surface)', fontSize: '13px', fontWeight: '600', color: 'var(--c-text-2)', cursor: 'pointer', fontFamily: 'inherit' },
  pageNumActive:{ background: '#2563eb', color: '#fff', border: '1px solid #2563eb' },
  fab:          { position: 'fixed', bottom: '32px', right: '32px', width: '52px', height: '52px', borderRadius: '50%', background: '#2563eb', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(37,99,235,0.4)', zIndex: 100 },
};

export default ReportsListPage;
