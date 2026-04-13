import { Link } from 'react-router-dom';
import { STATUS_COLORS } from '../constants/reportStatus';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

const ReportCard = ({ report }) => {
  const estadoNombre = report.estado?.nombre ?? report.status ?? '';
  const badge = STATUS_COLORS[estadoNombre] || {};
  const autor = report.usuario
    ? `${report.usuario.nombre} ${report.usuario.apellido}`
    : null;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>{report.titulo ?? report.title}</h3>
        <span style={{ ...styles.badge, ...badge }}>{estadoNombre}</span>
      </div>
      <p style={styles.description}>{report.descripcion ?? report.description}</p>
      {report.categoria && (
        <span style={styles.categoria}>{report.categoria.nombre}</span>
      )}
      <div style={styles.meta}>
        <span>📍 {report.latitud ?? report.latitude}, {report.longitud ?? report.longitude}</span>
        <span>{formatDate(report.fecha_reporte ?? report.created_at)}</span>
      </div>
      {autor && <p style={styles.author}>Por: {autor}</p>}
      <Link to={`/reports/${report.id}`} style={styles.link}>Ver detalle →</Link>
    </div>
  );
};

const styles = {
  card:        { background: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '8px' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' },
  title:       { margin: 0, fontSize: '16px' },
  badge:       { fontSize: '12px', padding: '2px 8px', borderRadius: '12px', whiteSpace: 'nowrap' },
  description: { margin: 0, fontSize: '14px', color: '#555' },
  categoria:   { fontSize: '12px', color: '#7c3aed', background: '#ede9fe', padding: '2px 8px', borderRadius: '12px', alignSelf: 'flex-start' },
  meta:        { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888' },
  author:      { margin: 0, fontSize: '12px', color: '#aaa' },
  link:        { fontSize: '13px', color: '#2563eb', textDecoration: 'none', alignSelf: 'flex-end' },
};

export default ReportCard;
