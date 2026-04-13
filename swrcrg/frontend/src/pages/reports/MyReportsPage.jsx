import { useEffect, useState } from 'react';
import ReportCard from '../../components/ReportCard';
import { getMyReports } from '../../services/report.service';

const MyReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getMyReports()
      .then(({ reportes }) => setReports(reportes))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={styles.center}>Cargando tus reportes...</p>;
  if (error)   return <p style={{ ...styles.center, color: '#dc2626' }}>{error}</p>;

  return (
    <div style={styles.wrapper}>
      <h2>Mis reportes</h2>
      {reports.length === 0 ? (
        <p style={styles.empty}>Aún no has creado ningún reporte.</p>
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

export default MyReportsPage;
