import { useEffect, useState } from 'react';
import ReportCard from '../../components/ReportCard';
import { getReports } from '../../services/report.service';

const ReportsListPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getReports()
      .then(({ reports }) => setReports(reports))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={styles.center}>Cargando reportes...</p>;
  if (error)   return <p style={{ ...styles.center, color: '#dc2626' }}>{error}</p>;

  return (
    <div style={styles.wrapper}>
      <h2>Reportes ciudadanos</h2>

      {reports.length === 0 ? (
        <p style={styles.empty}>No hay reportes registrados aún.</p>
      ) : (
        <div style={styles.grid}>
          {reports.map((r) => <ReportCard key={r.id} report={r} />)}
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: { maxWidth: '800px', margin: '0 auto', padding: '32px 16px' },
  grid:    { display: 'flex', flexDirection: 'column', gap: '16px' },
  center:  { textAlign: 'center', marginTop: '80px' },
  empty:   { color: '#888', textAlign: 'center', marginTop: '40px' },
};

export default ReportsListPage;
