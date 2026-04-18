import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, X } from 'lucide-react';
import ReportCard from '../../components/ReportCard';
import { ReportCardSkeleton } from '../../components/Skeleton';
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
  const [page, setPage]                 = useState(1);

  useEffect(() => {
    Promise.all([
      getReports(),
      getCategorias(),
    ])
      .then(([{ reportes }, { categorias }]) => {
        setReports(reportes);
        setCategorias(categorias);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, filterStatus, filterCat]);

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        r.titulo?.toLowerCase().includes(q) ||
        r.descripcion?.toLowerCase().includes(q) ||
        r.direccion_referencia?.toLowerCase().includes(q);
      const matchStatus = !filterStatus || r.estado?.nombre === filterStatus;
      const matchCat    = !filterCat    || r.categoria?.id === filterCat;
      return matchSearch && matchStatus && matchCat;
    });
  }, [reports, search, filterStatus, filterCat]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = () => { setSearch(''); setFilterStatus(''); setFilterCat(''); };
  const hasFilters   = search || filterStatus || filterCat;

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Reportes ciudadanos</h1>
            <p style={s.subtitle}>Monitoreo en tiempo real de la infraestructura y servicios de nuestra comunidad.</p>
          </div>
        </div>

        {/* filters */}
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

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={s.select}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} style={s.select}>
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre.replace(/_/g, ' ')}</option>
            ))}
          </select>

          {hasFilters && (
            <button onClick={clearFilters} style={s.clearAllBtn}>
              <X size={13} strokeWidth={2.5} />
              Limpiar
            </button>
          )}
        </div>

        {/* results count */}
        {!loading && !error && (
          <p style={s.resultsCount}>
            {filtered.length} reporte{filtered.length !== 1 ? 's' : ''}
            {hasFilters ? ' encontrados' : ' en total'}
          </p>
        )}

        {/* content */}
        {loading && (
          <div style={s.list}>
            {Array.from({ length: 4 }).map((_, i) => <ReportCardSkeleton key={i} />)}
          </div>
        )}
        {error   && <p style={{ ...s.center, color: '#dc2626' }}>{error}</p>}

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

      {/* FAB */}
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

  /* filters */
  filters:      { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' },
  searchWrap:   { display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 220px', border: '1px solid var(--c-border)', borderRadius: '8px', padding: '9px 12px', background: 'var(--c-surface)' },
  searchInput:  { flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: 'var(--c-text)', background: 'transparent', fontFamily: 'inherit' },
  clearBtn:     { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 },
  select:       { padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--c-border)', fontSize: '13px', fontFamily: 'inherit', color: 'var(--c-text)', background: 'var(--c-surface)', cursor: 'pointer', outline: 'none' },
  clearAllBtn:  { display: 'flex', alignItems: 'center', gap: '5px', padding: '9px 14px', borderRadius: '8px', border: '1px solid var(--c-border)', background: 'var(--c-surface)', fontSize: '13px', fontWeight: '600', color: 'var(--c-text-2)', cursor: 'pointer', fontFamily: 'inherit' },

  resultsCount: { fontSize: '13px', color: 'var(--c-text-3)', margin: '0 0 20px' },
  list:         { display: 'flex', flexDirection: 'column', gap: '20px' },
  center:       { textAlign: 'center', marginTop: '80px', color: 'var(--c-text-3)' },
  emptyWrap:    { textAlign: 'center', marginTop: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  empty:        { color: 'var(--c-text-3)', fontSize: '15px', margin: 0 },

  /* pagination */
  pagination:   { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '40px', flexWrap: 'wrap' },
  pageBtn:      { padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--c-border)', background: 'var(--c-surface)', fontSize: '13px', fontWeight: '600', color: 'var(--c-text)', cursor: 'pointer', fontFamily: 'inherit' },
  pageNumbers:  { display: 'flex', gap: '4px' },
  pageNum:      { width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--c-border)', background: 'var(--c-surface)', fontSize: '13px', fontWeight: '600', color: 'var(--c-text-2)', cursor: 'pointer', fontFamily: 'inherit' },
  pageNumActive:{ background: '#2563eb', color: '#fff', border: '1px solid #2563eb' },

  fab:          { position: 'fixed', bottom: '32px', right: '32px', width: '52px', height: '52px', borderRadius: '50%', background: '#2563eb', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(37,99,235,0.4)', zIndex: 100 },
};

export default ReportsListPage;
