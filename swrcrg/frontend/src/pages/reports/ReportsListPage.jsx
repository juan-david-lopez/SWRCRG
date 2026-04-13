import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ReportCard from '../../components/ReportCard';
import { getReports } from '../../services/report.service';
import { useAuth } from '../../context/AuthContext';

const ReportsListPage = () => {
  const { user }                    = useAuth();
  const navigate                    = useNavigate();
  const [reports, setReports]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    getReports()
      .then(({ reportes }) => setReports(reportes))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* header */}
        <div style={s.header}>
          <h1 style={s.title}>Reportes ciudadanos</h1>
          <p style={s.subtitle}>Monitoreo en tiempo real de la infraestructura y servicios de nuestra comunidad.</p>
        </div>

        {/* content */}
        {loading && <p style={s.center}>Cargando reportes...</p>}
        {error   && <p style={{ ...s.center, color: '#dc2626' }}>{error}</p>}

        {!loading && !error && reports.length === 0 && (
          <p style={s.empty}>No hay reportes registrados aún.</p>
        )}

        {!loading && !error && reports.length > 0 && (
          <div style={s.list}>
            {reports.map((r) => <ReportCard key={r.id} report={r} />)}
          </div>
        )}
      </div>

      {/* FAB: solo para usuarios autenticados */}
      {user && (
        <button style={s.fab} onClick={() => navigate('/reports/create')} title="Crear reporte">
          <Plus size={22} strokeWidth={2.5} color="#fff" />
        </button>
      )}
    </div>
  );
};

const s = {
  page:      { minHeight: '100vh', background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", position: 'relative', paddingBottom: '80px' },
  container: { maxWidth: '680px', margin: '0 auto', padding: '40px 20px' },
  header:    { marginBottom: '32px' },
  title:     { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' },
  subtitle:  { fontSize: '15px', color: '#64748b', margin: 0 },
  list:      { display: 'flex', flexDirection: 'column', gap: '20px' },
  center:    { textAlign: 'center', marginTop: '80px', color: '#94a3b8' },
  empty:     { textAlign: 'center', marginTop: '60px', color: '#94a3b8', fontSize: '15px' },
  fab:       { position: 'fixed', bottom: '32px', right: '32px', width: '52px', height: '52px', borderRadius: '50%', background: '#2563eb', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(37,99,235,0.4)', zIndex: 100 },
};

export default ReportsListPage;
