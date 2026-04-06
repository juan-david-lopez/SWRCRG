import { useEffect, useState } from 'react';
import { getReports, updateReportStatus } from '../../services/report.service';

const STATUSES   = ['pendiente', 'en_proceso', 'resuelto'];
const API_BASE   = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const STATUS_COLORS = {
  pendiente:  { background: '#fef9c3', color: '#854d0e' },
  en_proceso: { background: '#dbeafe', color: '#1e40af' },
  resuelto:   { background: '#dcfce7', color: '#166534' },
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

const AdminReportsPage = () => {
  const [reports, setReports]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [updating, setUpdating] = useState(null); // id del reporte en actualización

  useEffect(() => {
    getReports()
      .then(({ reports }) => setReports(reports))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id, status) => {
    setUpdating(id);
    try {
      const { report } = await updateReportStatus(id, status);
      setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: report.status } : r));
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
          {reports.map((r) => (
            <div key={r.id} style={styles.card}>

              <div style={styles.cardHeader}>
                <div>
                  <strong>{r.title}</strong>
                  <span style={{ ...styles.badge, ...STATUS_COLORS[r.status] }}>{r.status}</span>
                </div>
                <span style={styles.date}>{formatDate(r.created_at)}</span>
              </div>

              <p style={styles.desc}>{r.description}</p>
              <p style={styles.coords}>📍 {r.latitude}, {r.longitude}</p>

              {r.image_url && (
                <img
                  src={`${API_BASE}${r.image_url}`}
                  alt="evidencia"
                  style={styles.thumb}
                />
              )}

              <div style={styles.actions}>
                <label style={styles.selectLabel}>Cambiar estado:</label>
                <select
                  value={r.status}
                  disabled={updating === r.id}
                  onChange={(e) => handleStatusChange(r.id, e.target.value)}
                  style={styles.select}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {updating === r.id && <span style={styles.saving}>Guardando...</span>}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper:     { maxWidth: '860px', margin: '0 auto', padding: '32px 16px' },
  count:       { color: '#888', fontSize: '14px', marginTop: '-8px' },
  list:        { display: 'flex', flexDirection: 'column', gap: '16px' },
  card:        { background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '10px' },
  cardHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' },
  badge:       { marginLeft: '10px', fontSize: '12px', padding: '2px 8px', borderRadius: '12px' },
  date:        { fontSize: '12px', color: '#aaa', whiteSpace: 'nowrap' },
  desc:        { margin: 0, fontSize: '14px', color: '#555' },
  coords:      { margin: 0, fontSize: '12px', color: '#888' },
  thumb:       { width: '120px', height: '80px', objectFit: 'cover', borderRadius: '4px' },
  actions:     { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  selectLabel: { fontSize: '13px', color: '#555' },
  select:      { padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px', cursor: 'pointer' },
  saving:      { fontSize: '12px', color: '#2563eb' },
  center:      { textAlign: 'center', marginTop: '80px' },
  empty:       { color: '#888', textAlign: 'center', marginTop: '40px' },
};

export default AdminReportsPage;
