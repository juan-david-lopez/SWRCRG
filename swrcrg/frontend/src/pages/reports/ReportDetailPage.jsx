import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getReport, getReportHistory, getReportComments, addComment, deleteComment } from '../../services/report.service';
import { STATUS_COLORS } from '../../constants/reportStatus';
import { useAuth } from '../../context/AuthContext';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { Send, Trash2 } from 'lucide-react';
import { toast } from '../../components/Toast';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const formatDate = (iso) =>
  new Date(iso).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const STATUS_LABEL = { pendiente: 'Pendiente', en_proceso: 'En proceso', resuelto: 'Resuelto' };

const ReportDetailPage = () => {
  const { id }    = useParams();
  const { user }  = useAuth();
  const isAdmin   = user?.rol === 'administrador';

  const [reporte,     setReporte]     = useState(null);
  const [historial,   setHistorial]   = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [newComment,  setNewComment]  = useState('');
  const [sending,     setSending]     = useState(false);
  const [commentErr,  setCommentErr]  = useState('');

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

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSending(true);
    setCommentErr('');
    try {
      const { comentario } = await addComment(id, newComment.trim());
      setComentarios((prev) => [...prev, comentario]);
      setNewComment('');
      toast.success('Comentario agregado');
    } catch (err) {
      setCommentErr(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteComment = async (comentId) => {
    try {
      await deleteComment(id, comentId);
      setComentarios((prev) => prev.filter((c) => c.id !== comentId));
      toast.success('Comentario eliminado');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <p style={st.center}>Cargando...</p>;
  if (error)   return <p style={{ ...st.center, color: '#dc2626' }}>{error}</p>;
  if (!reporte) return null;

  const estadoNombre = reporte.estado?.nombre ?? '';
  const badge  = STATUS_COLORS[estadoNombre] || {};
  const center = [parseFloat(reporte.latitud), parseFloat(reporte.longitud)];

  return (
    <div style={st.wrapper}>
      <Link to="/reports" style={st.back}>
        <span>←</span> Volver a reportes
      </Link>

      {/* Main card */}
      <div style={st.card}>
        <div style={st.header}>
          <h2 style={st.cardTitle}>{reporte.titulo}</h2>
          {estadoNombre && (
            <span style={{ ...st.badge, ...badge }}>
              {STATUS_LABEL[estadoNombre] ?? estadoNombre}
            </span>
          )}
        </div>

        {reporte.categoria && (
          <span style={st.cat}>{reporte.categoria.nombre.replace(/_/g, ' ')}</span>
        )}

        <p style={st.desc}>{reporte.descripcion}</p>

        <div style={st.metaGroup}>
          {reporte.direccion_referencia && (
            <p style={st.meta}>📌 {reporte.direccion_referencia}</p>
          )}
          <p style={st.meta}>
            👤 {reporte.usuario?.nombre} {reporte.usuario?.apellido}
            {reporte.usuario?.correo && <span style={{ color: '#cbd5e1' }}> — {reporte.usuario.correo}</span>}
          </p>
          <p style={st.meta}>🗓 {formatDate(reporte.fecha_reporte)}</p>
        </div>

        {/* Mapa */}
        <div style={{ borderRadius: '10px', overflow: 'hidden', height: '280px' }}>
          <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={center} />
          </MapContainer>
        </div>

        {/* Imágenes */}
        {reporte.imagenes?.length > 0 && (
          <div>
            <p style={st.sectionLabel}>Imágenes</p>
            <div style={st.imgs}>
              {reporte.imagenes.map((img) => (
                <a key={img.id} href={`${API_BASE}${img.url_imagen}`} target="_blank" rel="noreferrer">
                  <img src={`${API_BASE}${img.url_imagen}`} alt={img.nombre_archivo} style={st.thumb} />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Historial */}
      {historial.length > 0 && (
        <div style={st.section}>
          <h3 style={st.sectionTitle}>Historial de estados</h3>
          <div style={st.timeline}>
            {historial.map((h) => {
              const hBadge = STATUS_COLORS[h.estado?.nombre] || {};
              return (
                <div key={h.id} style={st.timelineItem}>
                  <span style={{ ...st.badge, ...hBadge, flexShrink: 0 }}>
                    {STATUS_LABEL[h.estado?.nombre] ?? h.estado?.nombre}
                  </span>
                  <div>
                    <p style={st.timelineText}>
                      Por {h.usuario?.nombre} {h.usuario?.apellido} — {formatDate(h.fecha_cambio)}
                    </p>
                    {h.observacion && <p style={st.obs}>"{h.observacion}"</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Comentarios */}
      <div style={st.section}>
        <h3 style={st.sectionTitle}>
          Comentarios {comentarios.length > 0 && <span style={st.countBadge}>{comentarios.length}</span>}
        </h3>

        {comentarios.length === 0 && (
          <p style={st.noComments}>Aún no hay comentarios.</p>
        )}

        {comentarios.length > 0 && (
          <div style={st.comments}>
            {comentarios.map((c) => (
              <div key={c.id} style={st.comment}>
                <div style={st.commentHeader}>
                  <span style={st.commentAuthor}>
                    {c.usuario?.nombre} {c.usuario?.apellido}
                    <span style={st.commentDate}> — {formatDate(c.fecha_creacion)}</span>
                  </span>
                  {isAdmin && (
                    <button onClick={() => handleDeleteComment(c.id)} style={st.deleteBtn} title="Eliminar comentario">
                      <Trash2 size={13} strokeWidth={2} />
                    </button>
                  )}
                </div>
                <p style={st.commentText}>{c.comentario}</p>
              </div>
            ))}
          </div>
        )}

        {/* Form — solo admin puede comentar */}
        {isAdmin && (
          <form onSubmit={handleAddComment} style={st.commentForm}>
            <div style={st.commentInputWrap}>
              <input
                value={newComment}
                onChange={(e) => { setNewComment(e.target.value); setCommentErr(''); }}
                placeholder="Escribe un comentario oficial..."
                style={st.commentInput}
              />
              <button type="submit" disabled={sending || !newComment.trim()} style={{ ...st.sendBtn, opacity: (sending || !newComment.trim()) ? 0.5 : 1 }}>
                <Send size={15} strokeWidth={2} />
                {sending ? 'Enviando...' : 'Comentar'}
              </button>
            </div>
            {commentErr && <p style={st.commentErr}>{commentErr}</p>}
          </form>
        )}
      </div>
    </div>
  );
};

const st = {
  wrapper:        { maxWidth: '720px', margin: '0 auto', padding: '32px 20px 80px', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
  back:           { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b', textDecoration: 'none', fontWeight: '500' },
  card:           { background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: '14px' },
  header:         { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' },
  cardTitle:      { margin: 0, fontSize: '22px', fontWeight: '700', color: '#0f172a', lineHeight: '1.3' },
  badge:          { fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.4px' },
  cat:            { fontSize: '12px', fontWeight: '600', color: '#7c3aed', background: '#ede9fe', padding: '3px 10px', borderRadius: '20px', alignSelf: 'flex-start' },
  desc:           { margin: 0, fontSize: '15px', color: '#64748b', lineHeight: '1.6' },
  metaGroup:      { display: 'flex', flexDirection: 'column', gap: '4px' },
  meta:           { margin: 0, fontSize: '13px', color: '#94a3b8' },
  sectionLabel:   { margin: '0 0 10px', fontSize: '13px', fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' },
  imgs:           { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  thumb:          { width: '140px', height: '100px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' },

  section:        { background: '#fff', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  sectionTitle:   { margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' },
  countBadge:     { fontSize: '11px', fontWeight: '700', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '20px' },

  timeline:       { display: 'flex', flexDirection: 'column', gap: '12px' },
  timelineItem:   { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  timelineText:   { margin: 0, fontSize: '13px', color: '#64748b' },
  obs:            { margin: '4px 0 0', fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' },

  noComments:     { fontSize: '14px', color: '#94a3b8', margin: '0 0 16px' },
  comments:       { display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' },
  comment:        { borderLeft: '3px solid #e2e8f0', paddingLeft: '14px' },
  commentHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  commentAuthor:  { fontSize: '13px', fontWeight: '600', color: '#0f172a' },
  commentDate:    { fontWeight: 400, color: '#94a3b8' },
  commentText:    { margin: 0, fontSize: '14px', color: '#64748b' },
  deleteBtn:      { background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', padding: '2px', opacity: 0.6 },

  commentForm:    { display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' },
  commentInputWrap: { display: 'flex', gap: '8px' },
  commentInput:   { flex: 1, border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', fontFamily: 'inherit', color: '#0f172a', outline: 'none' },
  sendBtn:        { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' },
  commentErr:     { fontSize: '12px', color: '#ef4444', margin: 0 },

  center:         { textAlign: 'center', marginTop: '80px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: '#94a3b8' },
};

export default ReportDetailPage;
