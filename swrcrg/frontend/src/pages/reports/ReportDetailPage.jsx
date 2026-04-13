import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getReport, getReportHistory, getReportComments } from '../../services/report.service';
import { STATUS_COLORS } from '../../constants/reportStatus';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const formatDate = (iso) =>
  new Date(iso).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const ReportDetailPage = () => {
  const { id } = useParams();
  const [reporte,    setReporte]    = useState(null);
  const [historial,  setHistorial]  = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  useEffect(() => {
    Promise.all([
      getReport(id),
      getReportHistory(id),
      getReportComments(id),
    ])
      .then(([{ reporte }, { historial }, { comentarios }]) => {
        setReporte(reporte);
        setHistorial(historial);
        setComentarios(comentarios);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={styles.center}>Cargando...</p>;
  if (error)   return <p style={{ ...styles.center, color: '#dc2626' }}>{error}</p>;
  if (!reporte) return null;

  const estadoNombre = reporte.estado?.nombre ?? '';
  const badge = STATUS_COLORS[estadoNombre] || {};
  const center = [parseFloat(reporte.latitud), parseFloat(reporte.longitud)];

  return (
    <div style={styles.wrapper}>
      <Link to="/reports" style={styles.back}>← Volver a reportes</Link>

      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>{reporte.titulo}</h2>
          <span style={{ ...styles.badge, ...badge }}>{estadoNombre}</span>
        </div>

        {reporte.categoria && (
          <span style={styles.cat}>{reporte.categoria.nombre.replace(/_/g, ' ')}</span>
        )}

        <p style={styles.desc}>{reporte.descripcion}</p>

        {reporte.direccion_referencia && (
          <p style={styles.meta}>📌 {reporte.direccion_referencia}</p>
        )}

        <p style={styles.meta}>
          👤 {reporte.usuario?.nombre} {reporte.usuario?.apellido}
          {reporte.usuario?.correo && <span style={{ color: '#aaa' }}> — {reporte.usuario.correo}</span>}
        </p>
        <p style={styles.meta}>🗓 {formatDate(reporte.fecha_reporte)}</p>

        {/* Mapa */}
        <div style={{ borderRadius: '8px', overflow: 'hidden', height: '280px' }}>
          <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={center} />
          </MapContainer>
        </div>

        {/* Imágenes */}
        {reporte.imagenes?.length > 0 && (
          <div>
            <p style={styles.sectionTitle}>Imágenes</p>
            <div style={styles.imgs}>
              {reporte.imagenes.map((img) => (
                <a key={img.id} href={`${API_BASE}${img.url_imagen}`} target="_blank" rel="noreferrer">
                  <img src={`${API_BASE}${img.url_imagen}`} alt={img.nombre_archivo} style={styles.thumb} />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Historial de estados */}
      {historial.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Historial de estados</h3>
          <div style={styles.timeline}>
            {historial.map((h) => {
              const hBadge = STATUS_COLORS[h.estado?.nombre] || {};
              return (
                <div key={h.id} style={styles.timelineItem}>
                  <span style={{ ...styles.badge, ...hBadge }}>{h.estado?.nombre}</span>
                  <div>
                    <p style={styles.timelineText}>
                      Por {h.usuario?.nombre} {h.usuario?.apellido} — {formatDate(h.fecha_cambio)}
                    </p>
                    {h.observacion && <p style={styles.obs}>"{h.observacion}"</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Comentarios */}
      {comentarios.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Comentarios</h3>
          <div style={styles.comments}>
            {comentarios.map((c) => (
              <div key={c.id} style={styles.comment}>
                <p style={styles.commentAuthor}>
                  {c.usuario?.nombre} {c.usuario?.apellido}
                  <span style={styles.commentDate}> — {formatDate(c.fecha_creacion)}</span>
                </p>
                <p style={styles.commentText}>{c.comentario}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper:       { maxWidth: '720px', margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px' },
  back:          { fontSize: '14px', color: '#2563eb', textDecoration: 'none' },
  card:          { background: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '12px' },
  header:        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' },
  badge:         { fontSize: '12px', padding: '3px 10px', borderRadius: '12px', whiteSpace: 'nowrap' },
  cat:           { fontSize: '12px', color: '#7c3aed', background: '#ede9fe', padding: '2px 8px', borderRadius: '12px', alignSelf: 'flex-start' },
  desc:          { margin: 0, fontSize: '15px', color: '#444', lineHeight: '1.6' },
  meta:          { margin: 0, fontSize: '13px', color: '#666' },
  imgs:          { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  thumb:         { width: '140px', height: '100px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer' },
  section:       { background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  sectionTitle:  { margin: '0 0 12px', fontSize: '15px', fontWeight: 600, color: '#333' },
  timeline:      { display: 'flex', flexDirection: 'column', gap: '12px' },
  timelineItem:  { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  timelineText:  { margin: 0, fontSize: '13px', color: '#555' },
  obs:           { margin: '4px 0 0', fontSize: '13px', color: '#888', fontStyle: 'italic' },
  comments:      { display: 'flex', flexDirection: 'column', gap: '12px' },
  comment:       { borderLeft: '3px solid #e5e7eb', paddingLeft: '12px' },
  commentAuthor: { margin: '0 0 4px', fontSize: '13px', fontWeight: 600, color: '#333' },
  commentDate:   { fontWeight: 400, color: '#aaa' },
  commentText:   { margin: 0, fontSize: '14px', color: '#555' },
  center:        { textAlign: 'center', marginTop: '80px' },
};

export default ReportDetailPage;
