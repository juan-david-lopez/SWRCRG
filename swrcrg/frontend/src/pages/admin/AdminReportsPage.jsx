import { useEffect, useState } from 'react';
import { getReports, updateReportStatus } from '../../services/report.service';
import { REPORT_STATUSES, STATUS_COLORS } from '../../constants/reportStatus';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

const AdminReportsPage = () => {
  const [reports, setReports]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [updating, setUpdating]     = useState(null);
  const [observaciones, setObservaciones] = useState({});

  useEffect(() => {
    getReports()
      .then(({ reportes }) => setReports(reportes))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id, estado) => {
    setUpdating(id);
    try {
      const { reporte } = await updateReportStatus(id, estado, observaciones[id] || '');
      setReports((prev) => prev.map((r) => r.id === id ? { ...r, estado: reporte.estado } : r));
      setObservaciones((prev) => ({ ...prev, [id]: '' }));
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <p style={styles.center}>Cargando reportes...</p>;
  if (error)   return <p style={{ ...styles.center, color: '#dc2626' }}>{error}</p>;

  return (
    <div style={styles.wrapper}>
      <h2>Panel admin — Reportes</h2>
      <p style={styles.count}>{reports.length} reporte(s) registrado(s)</p>

      {reports.length === 0 ? (
        <p style={styles.empty}>No hay reportes aún.</p>
      ) : (
        <div style={styles.list}>
          {reports.map((r) => {
            const estadoNombre = r.estado?.nombre ?? '';
            const badge = STATUS_COLORS[estadoNombre] || {};
            return (
              <div key={r.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <strong>{r.titulo}</strong>
                    <span style={{ ...styles.badge, ...badge }}>{estadoNombre}</span>
                    {r.categoria && <span style={styles.cat}>{r.categoria.nombre.replace(/_/g, ' ')}</span>}
                  </div>
                  <span style={styles.date}>{formatDate(r.fecha_reporte)}</span>
                </div>

                <p style={styles.desc}>{r.descripcion}</p>
                {r.direccion_referencia && <p style={styles.dir}>📌 {r.direccion_referencia}</p>}
                <p style={styles.coords}>🌐 {r.latitud}, {r.longitud}</p>
                {r.usuario && (
                  <p style={styles.autor}>👤 {r.usuario.nombre} {r.usuario.apellido}</p>
                )}

                {r.imagenes?.length > 0 && (
                  <div style={styles.imgs}>
                    {r.imagenes.map((img) => (
                      <img key={img.id} src={`${API_BASE}${img.url_imagen}`} alt="evidencia" style={styles.thumb} />
                    ))}
                  </div>
                )}

                <div style={styles.actions}>
                  <input
                    type="text"
                    placeholder="Observación (opcional)"
                    value={observaciones[r.id] || ''}
                    onChange={(e) => setObservaciones((prev) => ({ ...prev, [r.id]: e.target.value }))}
                    style={styles.obsInput}
                  />
                  <select
                    value={estadoNombre}
                    disabled={updating === r.id}
                    onChange={(e) => handleStatusChange(r.id, e.target.value)}
                    style={styles.select}
                  >
                    {REPORT_STATUSES.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                  {updating === r.id && <span style={styles.saving}>Guardando...</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper:     { maxWidth: '900px', margin: '0 auto', padding: '32px 16px' },
  count:       { color: '#888', fontSize: '14px', marginTop: '-8px' },
  list:        { display: 'flex', flexDirection: 'column', gap: '16px' },
  card:        { background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '10px' },
  cardHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' },
  badge:       { fontSize: '12px', padding: '2px 8px', borderRadius: '12px' },
  cat:         { fontSize: '12px', color: '#7c3aed', background: '#ede9fe', padding: '2px 8px', borderRadius: '12px' },
  date:        { fontSize: '12px', color: '#aaa', whiteSpace: 'nowrap' },
  desc:        { margin: 0, fontSize: '14px', color: '#555' },
  dir:         { margin: 0, fontSize: '13px', color: '#666' },
  coords:      { margin: 0, fontSize: '12px', color: '#888' },
  autor:       { margin: 0, fontSize: '12px', color: '#888' },
  imgs:        { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  thumb:       { width: '120px', height: '80px', objectFit: 'cover', borderRadius: '4px' },
  actions:     { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  obsInput:    { flex: 1, minWidth: '160px', padding: '6px 8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' },
  select:      { padding: '6px 8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', cursor: 'pointer' },
  saving:      { fontSize: '12px', color: '#2563eb' },
  center:      { textAlign: 'center', marginTop: '80px' },
  empty:       { color: '#888', textAlign: 'center', marginTop: '40px' },
};

export default AdminReportsPage;
