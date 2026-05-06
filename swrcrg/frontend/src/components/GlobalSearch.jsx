import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, FileText, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getReports } from '../services/report.service';

const STATUS_COLORS = {
  pendiente:  { bg: '#fef3c7', color: '#92400e' },
  verificado: { bg: '#dbeafe', color: '#1e40af' },
  en_proceso: { bg: '#ede9fe', color: '#5b21b6' },
  resuelto:   { bg: '#dcfce7', color: '#166534' },
  rechazado:  { bg: '#fee2e2', color: '#991b1b' },
};
const STATUS_LABEL = { pendiente: 'Pendiente', verificado: 'Verificado', en_proceso: 'En proceso', resuelto: 'Resuelto', rechazado: 'Rechazado' };

const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const GlobalSearch = () => {
  const [open, setOpen]         = useState(false);
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const inputRef                = useRef(null);
  const navigate                = useNavigate();
  const debouncedQuery          = useDebounce(query, 300);

  // Buscar en el servidor con debounce
  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); return; }
    setLoading(true);
    getReports({ search: debouncedQuery, limit: 8, page: 1 })
      .then((data) => setResults(data.reportes ?? []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  // Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setOpen((o) => !o); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else { setQuery(''); setResults([]); }
  }, [open]);

  const handleSelect = (id) => {
    navigate(`/reports/${id}`);
    setOpen(false);
  };

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '6px 12px', borderRadius: '8px',
        border: '1px solid var(--c-border)', background: 'var(--c-bg)',
        color: 'var(--c-text-3)', fontSize: '13px', cursor: 'pointer',
        fontFamily: 'inherit',
      }}
      title="Buscar (Ctrl+K)"
    >
      <Search size={14} strokeWidth={2} />
      <span className="hide-mobile">Buscar...</span>
      <kbd style={{ fontSize: '11px', background: 'var(--c-border)', padding: '1px 5px', borderRadius: '4px', color: 'var(--c-text-3)' }} className="hide-mobile">⌘K</kbd>
    </button>
  );

  return createPortal(
    <div style={s.overlay} onClick={() => setOpen(false)}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.inputRow}>
          <Search size={16} strokeWidth={2} color="var(--c-text-3)" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar reportes, categorías, ubicaciones..."
            style={s.input}
          />
          {loading && (
            <div style={{ width: '14px', height: '14px', border: '2px solid var(--c-border)', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin .6s linear infinite', flexShrink: 0 }} />
          )}
          {query && !loading && (
            <button onClick={() => setQuery('')} style={s.clearBtn}>
              <X size={14} strokeWidth={2} color="var(--c-text-3)" />
            </button>
          )}
          <button onClick={() => setOpen(false)} style={{ ...s.clearBtn, marginLeft: '4px', fontSize: '12px', color: 'var(--c-text-3)', padding: '2px 6px' }}>
            Esc
          </button>
        </div>

        {results.length > 0 && (
          <div style={s.results}>
            {results.map((r) => {
              const st = STATUS_COLORS[r.estado?.nombre] || { bg: '#f3f4f6', color: '#374151' };
              return (
                <button key={r.id} onClick={() => handleSelect(r.id)} style={s.resultItem}>
                  <div style={s.resultIcon}>
                    <FileText size={14} strokeWidth={2} color="#2563eb" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <p style={s.resultTitle}>{r.titulo}</p>
                    <p style={s.resultMeta}>
                      {r.categoria?.nombre?.replace(/_/g, ' ')}
                      {r.direccion_referencia && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <MapPin size={10} strokeWidth={2} /> {r.direccion_referencia}
                        </span>
                      )}
                    </p>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: st.bg, color: st.color, flexShrink: 0 }}>
                    {STATUS_LABEL[r.estado?.nombre] || r.estado?.nombre}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {query && !loading && results.length === 0 && (
          <div style={s.empty}>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--c-text-3)' }}>Sin resultados para "{query}"</p>
          </div>
        )}

        {!query && (
          <div style={s.hint}>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--c-text-3)' }}>Escribe para buscar en todos los reportes</p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

const s = {
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 9998, padding: '80px 16px 16px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
  modal:      { background: 'var(--c-surface)', borderRadius: '14px', width: '100%', maxWidth: '560px', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', overflow: 'hidden', border: '1px solid var(--c-border)' },
  inputRow:   { display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderBottom: '1px solid var(--c-border)' },
  input:      { flex: 1, border: 'none', outline: 'none', fontSize: '15px', color: 'var(--c-text)', background: 'transparent', fontFamily: 'inherit' },
  clearBtn:   { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px', borderRadius: '4px' },
  results:    { maxHeight: '360px', overflowY: 'auto' },
  resultItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid var(--c-border)', fontFamily: 'inherit' },
  resultIcon: { width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  resultTitle:{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--c-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  resultMeta: { margin: '2px 0 0', fontSize: '12px', color: 'var(--c-text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', gap: '8px', alignItems: 'center' },
  empty:      { padding: '24px 16px', textAlign: 'center' },
  hint:       { padding: '20px 16px', textAlign: 'center' },
};

export default GlobalSearch;
