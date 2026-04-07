import { STATUS_COLORS } from '../constants/reportStatus';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

const ReportCard = ({ report }) => {
  const badge = STATUS_COLORS[report.status] || {};

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>{report.title}</h3>
        <span style={{ ...styles.badge, ...badge }}>{report.status}</span>
      </div>
      <p style={styles.description}>{report.description}</p>
      <div style={styles.meta}>
        <span>📍 {report.latitude}, {report.longitude}</span>
        <span>{formatDate(report.created_at)}</span>
      </div>
      {report.user_name && <p style={styles.author}>Por: {report.user_name}</p>}
    </div>
  );
};

const styles = {
  card:        { background: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '8px' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' },
  title:       { margin: 0, fontSize: '16px' },
  badge:       { fontSize: '12px', padding: '2px 8px', borderRadius: '12px', whiteSpace: 'nowrap' },
  description: { margin: 0, fontSize: '14px', color: '#555' },
  meta:        { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888' },
  author:      { margin: 0, fontSize: '12px', color: '#aaa' },
};

export default ReportCard;
