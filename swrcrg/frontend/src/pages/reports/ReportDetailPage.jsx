import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getReport, getReportHistory, getReportComments, addComment, deleteComment, likeComment, voteReport, reportContent, reenviarReporte, editReport } from '../../services/report.service';
import { STATUS_COLORS, STATUS_LABEL } from '../../constants/reportStatus';
import { useAuth } from '../../context/AuthContext';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { Send, Trash2, ThumbsUp, Share2, MapPin, User, Calendar, Flag, RotateCcw, XCircle, Heart, MessageSquare, X } from 'lucide-react';
import { toast } from '../../components/Toast';
import Lightbox from '../../components/Lightbox';
import { TILE_URL, TILE_ATTR, createStatusIcon } from '../../components/MapMarkers';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const formatDate = (iso) =>
  new Date(iso).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

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
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [showEditReenvio, setShowEditReenvio] = useState(false);
  const [replyingTo,  setReplyingTo]  = useState(null); // comentario_id al que se responde
  const [replyText,   setReplyText]   = useState('');

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
      setComentarios((prev) => [...prev, { ...comentario, total_likes: 0, liked: false, respuestas: [] }]);
      setNewComment('');
      toast.success('Comentario agregado');
    } catch (err) {
      setCommentErr(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleAddReply = async (parentId) => {
    if (!replyText.trim()) return;
    try {
      const { comentario } = await addComment(id, replyText.trim(), parentId);
      setComentarios((prev) => prev.map((c) =>
        c.id === parentId
          ? { ...c, respuestas: [...(c.respuestas ?? []), { ...comentario, total_likes: 0, liked: false }] }
          : c
      ));
      setReplyingTo(null);
      setReplyText('');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleLike = async (comentarioId, isReply = false, parentId = null) => {
    if (!user) return toast.error('Debes iniciar sesión para dar me gusta');
    try {
      const { liked, total_likes } = await likeComment(id, comentarioId);
      setComentarios((prev) => prev.map((c) => {
        if (!isReply && c.id === comentarioId) return { ...c, liked, total_likes };
        if (isReply && c.id === parentId) {
          return {
            ...c,
            respuestas: (c.respuestas ?? []).map((r) =>
              r.id === comentarioId ? { ...r, liked, total_likes } : r
            ),
          };
        }
        return c;
      }));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteComment = async (comentId, parentId = null) => {
    try {
      await deleteComment(id, comentId);
      if (parentId) {
        setComentarios((prev) => prev.map((c) =>
          c.id === parentId
            ? { ...c, respuestas: (c.respuestas ?? []).filter((r) => r.id !== comentId) }
            : c
        ));
      } else {
        setComentarios((prev) => prev.filter((c) => c.id !== comentId));
      }
      toast.success('Comentario eliminado');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleVote = async () => {
    if (!user) return toast.error('Debes iniciar sesión para votar');
    try {
      const { votos, voted } = await voteReport(id);
      setReporte((prev) => ({ ...prev, votos, voted }));
      toast.success(voted ? '¡Voto registrado!' : 'Voto retirado');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: reporte?.titulo, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Enlace copiado al portapapeles');
      }
    } catch {
      toast.error('No se pudo compartir');
    }
  };

  const handleReportContent = async () => {
    if (!user) return toast.error('Debes iniciar sesión para reportar contenido');
    try {
      await reportContent(id, 'Contenido inapropiado');
      toast.success('Contenido reportado. Lo revisaremos pronto.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReenviar = () => {
    setShowEditReenvio(true);
  };

  const handleSaveReenvio = async (data) => {
    try {
      await editReport(id, data);
      const { reporte: updated } = await reenviarReporte(id);
      setReporte((prev) => ({ ...prev, ...data, estado: updated.estado, motivo_rechazo: null }));
      setShowEditReenvio(false);
      toast.success('Reporte editado y reenviado para revisión');
    } catch (err) {
      toast.error(err.message);
    }
  };  if (loading) return <p style={st.center}>Cargando...</p>;
  if (error)   return <p style={{ ...st.center, color: '#dc2626' }}>{error}</p>;
  if (!reporte) return null;

  const estadoNombre = reporte.estado?.nombre ?? '';
  const badge  = STATUS_COLORS[estadoNombre] || {};
  const center = [parseFloat(reporte.latitud), parseFloat(reporte.longitud)];
  const canComment = !!user; // cualquier usuario autenticado puede comentar

  return (
    <div style={st.wrapper}>
      <Link to="/reports" style={st.back}>
        <span>←</span> Volver a reportes
      </Link>

      {/* Main card */}
      <div style={st.card}>
        <div style={st.header}>
          <h2 style={st.cardTitle}>{reporte.titulo}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {estadoNombre && (
              <span style={{ ...st.badge, ...badge }}>
                {STATUS_LABEL[estadoNombre] ?? estadoNombre}
              </span>
            )}
            <button onClick={handleVote} style={{ ...st.actionBtn, color: reporte.voted ? '#2563eb' : 'var(--c-text-3)' }} title="Apoyar reporte">
              <ThumbsUp size={15} strokeWidth={2} />
              <span>{reporte.votos ?? 0}</span>
            </button>
            <button onClick={handleShare} style={st.actionBtn} title="Compartir">
              <Share2 size={15} strokeWidth={2} />
            </button>
            {user && reporte.usuario_id !== user.id && (
              <button onClick={handleReportContent} style={{ ...st.actionBtn, color: '#ef4444' }} title="Reportar contenido inapropiado">
                <Flag size={15} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        {reporte.categoria && (
          <span style={st.cat}>{reporte.categoria.nombre.replace(/_/g, ' ')}</span>
        )}

        <p style={st.desc}>{reporte.descripcion}</p>

        {/* Banner de rechazo — solo visible para el dueño */}
        {estadoNombre === 'rechazado' && reporte.motivo_rechazo && user?.id === reporte.usuario_id && (
          <div style={st.rechazoBanner}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <XCircle size={16} strokeWidth={2} color="#991b1b" />
              <p style={st.rechazoTitle}>Tu reporte fue rechazado</p>
            </div>
            <p style={st.rechazoMsg}><strong>Motivo:</strong> {reporte.motivo_rechazo}</p>
            <p style={{ margin: '4px 0 10px', fontSize: '13px', color: '#7f1d1d' }}>
              Puedes corregir el reporte y reenviarlo para una nueva revisión, o eliminarlo.
            </p>
            <button onClick={handleReenviar} style={st.reenviarBtn}>
              <RotateCcw size={14} strokeWidth={2} />
              Reenviar para revisión
            </button>
          </div>
        )}

        <div style={st.metaGroup}>
          {reporte.direccion_referencia && (
            <p style={st.meta}>
              <MapPin size={13} strokeWidth={2} color="var(--c-text-3)" style={{ flexShrink: 0 }} />
              {reporte.direccion_referencia}
            </p>
          )}
          <p style={st.meta}>
            <User size={13} strokeWidth={2} color="var(--c-text-3)" style={{ flexShrink: 0 }} />
            {reporte.usuario?.nombre} {reporte.usuario?.apellido}
            {reporte.usuario?.correo && <span style={{ color: 'var(--c-text-3)' }}> — {reporte.usuario.correo}</span>}
          </p>
          <p style={st.meta}>
            <Calendar size={13} strokeWidth={2} color="var(--c-text-3)" style={{ flexShrink: 0 }} />
            {formatDate(reporte.fecha_reporte)}
          </p>
        </div>

        {/* Mapa */}
        <div style={{ borderRadius: '12px', overflow: 'hidden', height: '280px', border: '1px solid var(--c-border)' }}>
          <MapContainer center={center} zoom={16} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false} zoomControl={true}>
            <TileLayer url={TILE_URL} attribution={TILE_ATTR} />
            <Marker position={center} icon={createStatusIcon(estadoNombre, 18)} />
          </MapContainer>
        </div>

        {/* Imágenes */}
        {reporte.imagenes?.length > 0 && (
          <div>
            <p style={st.sectionLabel}>Imágenes</p>
            <div style={st.imgs}>
              {reporte.imagenes.map((img, idx) => (
                <img
                  key={img.id}
                  src={`${API_BASE}${img.url_imagen}`}
                  alt={img.nombre_archivo}
                  style={{ ...st.thumb, cursor: 'zoom-in' }}
                  onClick={() => setLightboxIdx(idx)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Historial — solo visible para el admin o el dueño del reporte */}
      {historial.length > 0 && (isAdmin || user?.id === reporte.usuario_id) && (
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
                {/* Cabecera */}
                <div style={st.commentHeader}>
                  <span style={st.commentAuthor}>
                    {c.usuario?.nombre} {c.usuario?.apellido}
                    <span style={st.commentDate}> — {formatDate(c.fecha_creacion)}</span>
                  </span>
                  {(isAdmin || c.usuario?.id === user?.id) && (
                    <button onClick={() => handleDeleteComment(c.id)} style={st.deleteBtn} title="Eliminar comentario">
                      <Trash2 size={13} strokeWidth={2} />
                    </button>
                  )}
                </div>

                {/* Texto */}
                <p style={st.commentText}>{c.comentario}</p>

                {/* Acciones */}
                <div style={st.commentActions}>
                  <button
                    onClick={() => handleLike(c.id)}
                    style={{ ...st.likeBtn, color: c.liked ? '#e11d48' : 'var(--c-text-3)', borderColor: c.liked ? '#fda4af' : 'var(--c-border)' }}
                    title="Me gusta"
                  >
                    <Heart size={13} strokeWidth={2} fill={c.liked ? '#e11d48' : 'none'} />
                    {c.total_likes > 0 && <span>{c.total_likes}</span>}
                  </button>
                  {user && (
                    <button
                      onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                      style={{ ...st.replyBtn, color: replyingTo === c.id ? '#2563eb' : 'var(--c-text-3)' }}
                    >
                      <MessageSquare size={13} strokeWidth={2} />
                      {c.respuestas?.length > 0 ? `${c.respuestas.length} respuesta${c.respuestas.length > 1 ? 's' : ''}` : 'Responder'}
                    </button>
                  )}
                </div>

                {/* Caja de respuesta */}
                {replyingTo === c.id && (
                  <div style={st.replyBox}>
                    <input
                      autoFocus
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddReply(c.id)}
                      placeholder="Escribe una respuesta..."
                      style={st.replyInput}
                    />
                    <button onClick={() => handleAddReply(c.id)} disabled={!replyText.trim()} style={{ ...st.replySendBtn, opacity: replyText.trim() ? 1 : 0.5 }}>
                      <Send size={13} strokeWidth={2} />
                    </button>
                  </div>
                )}

                {/* Respuestas */}
                {c.respuestas?.length > 0 && (
                  <div style={st.replies}>
                    {c.respuestas.map((r) => (
                      <div key={r.id} style={st.reply}>
                        <div style={st.commentHeader}>
                          <span style={st.commentAuthor}>
                            {r.usuario?.nombre} {r.usuario?.apellido}
                            <span style={st.commentDate}> — {formatDate(r.fecha_creacion)}</span>
                          </span>
                          {(isAdmin || r.usuario?.id === user?.id) && (
                            <button onClick={() => handleDeleteComment(r.id, c.id)} style={st.deleteBtn} title="Eliminar respuesta">
                              <Trash2 size={13} strokeWidth={2} />
                            </button>
                          )}
                        </div>
                        <p style={st.commentText}>{r.comentario}</p>
                        <div style={st.commentActions}>
                          <button
                            onClick={() => handleLike(r.id, true, c.id)}
                            style={{ ...st.likeBtn, color: r.liked ? '#e11d48' : 'var(--c-text-3)', borderColor: r.liked ? '#fda4af' : 'var(--c-border)' }}
                          >
                            <Heart size={12} strokeWidth={2} fill={r.liked ? '#e11d48' : 'none'} />
                            {r.total_likes > 0 && <span>{r.total_likes}</span>}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Form nuevo comentario */}
        {canComment && (
          <form onSubmit={handleAddComment} style={st.commentForm}>
            <div style={st.commentInputWrap}>
              <input
                value={newComment}
                onChange={(e) => { setNewComment(e.target.value); setCommentErr(''); }}
                placeholder={isAdmin ? 'Escribe un comentario oficial...' : 'Escribe un comentario...'}
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

      {/* Lightbox */}
      {reporte.imagenes?.length > 0 && (
        <Lightbox
          images={reporte.imagenes.map((img) => `${API_BASE}${img.url_imagen}`)}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onPrev={() => setLightboxIdx((i) => (i - 1 + reporte.imagenes.length) % reporte.imagenes.length)}
          onNext={() => setLightboxIdx((i) => (i + 1) % reporte.imagenes.length)}
        />
      )}

      {/* Modal editar y reenviar */}
      {showEditReenvio && reporte && (
        <EditReenvioModal
          reporte={reporte}
          onSave={handleSaveReenvio}
          onCancel={() => setShowEditReenvio(false)}
        />
      )}
    </div>
  );};

const st = {  wrapper:        { maxWidth: '720px', margin: '0 auto', padding: '32px 20px 80px', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
  back:           { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--c-text-2)', textDecoration: 'none', fontWeight: '500' },
  card:           { background: 'var(--c-surface)', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 12px var(--c-shadow)', display: 'flex', flexDirection: 'column', gap: '14px' },
  header:         { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' },
  cardTitle:      { margin: 0, fontSize: '22px', fontWeight: '700', color: 'var(--c-text)', lineHeight: '1.3' },
  badge:          { fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.4px' },
  cat:            { fontSize: '12px', fontWeight: '600', color: '#7c3aed', background: '#ede9fe', padding: '3px 10px', borderRadius: '20px', alignSelf: 'flex-start' },
  desc:           { margin: 0, fontSize: '15px', color: 'var(--c-text-2)', lineHeight: '1.6' },
  metaGroup:      { display: 'flex', flexDirection: 'column', gap: '4px' },
  meta:           { margin: 0, fontSize: '13px', color: 'var(--c-text-3)', display: 'flex', alignItems: 'center', gap: '6px' },
  sectionLabel:   { margin: '0 0 10px', fontSize: '13px', fontWeight: '700', color: 'var(--c-text)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  imgs:           { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  thumb:          { width: '140px', height: '100px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' },

  section:        { background: 'var(--c-surface)', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 2px 12px var(--c-shadow)' },
  sectionTitle:   { margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: 'var(--c-text)', display: 'flex', alignItems: 'center', gap: '8px' },
  countBadge:     { fontSize: '11px', fontWeight: '700', background: 'var(--c-bg)', color: 'var(--c-text-2)', padding: '2px 8px', borderRadius: '20px' },

  timeline:       { display: 'flex', flexDirection: 'column', gap: '12px' },
  timelineItem:   { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  timelineText:   { margin: 0, fontSize: '13px', color: 'var(--c-text-2)' },
  obs:            { margin: '4px 0 0', fontSize: '13px', color: 'var(--c-text-3)', fontStyle: 'italic' },

  noComments:     { fontSize: '14px', color: 'var(--c-text-3)', margin: '0 0 16px' },
  comments:       { display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' },
  comment:        { borderLeft: '3px solid var(--c-border)', paddingLeft: '14px' },
  commentHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  commentAuthor:  { fontSize: '13px', fontWeight: '600', color: 'var(--c-text)' },
  commentDate:    { fontWeight: 400, color: 'var(--c-text-3)' },
  commentText:    { margin: 0, fontSize: '14px', color: 'var(--c-text-2)' },
  deleteBtn:      { background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', padding: '2px', opacity: 0.6 },

  commentForm:    { display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--c-bg)', paddingTop: '16px' },
  commentInputWrap: { display: 'flex', gap: '8px' },
  commentInput:   { flex: 1, border: '1px solid var(--c-border)', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', fontFamily: 'inherit', color: 'var(--c-text)', outline: 'none' },
  sendBtn:        { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' },
  commentErr:     { fontSize: '12px', color: '#ef4444', margin: 0 },

  commentActions: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' },
  likeBtn:        { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: '1px solid var(--c-border)', borderRadius: '20px', padding: '3px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'inherit', transition: 'color 0.15s' },
  replyBtn:       { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'inherit', padding: '3px 0' },
  replyBox:       { display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center' },
  replyInput:     { flex: 1, border: '1px solid var(--c-border)', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', fontFamily: 'inherit', color: 'var(--c-text)', outline: 'none', background: 'var(--c-bg)' },
  replySendBtn:   { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', flexShrink: 0 },
  replies:        { marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '16px', borderLeft: '2px solid var(--c-border)' },
  reply:          { display: 'flex', flexDirection: 'column', gap: '4px' },

  actionBtn:      { display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: '1px solid var(--c-border)', borderRadius: '20px', padding: '4px 10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: 'var(--c-text-3)', fontFamily: 'inherit' },
  rechazoBanner:  { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px' },
  rechazoTitle:   { margin: 0, fontSize: '14px', fontWeight: '700', color: '#991b1b' },
  rechazoMsg:     { margin: 0, fontSize: '14px', color: '#7f1d1d', lineHeight: '1.5' },
  reenviarBtn:    { alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
  center:         { textAlign: 'center', marginTop: '80px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: 'var(--c-text-3)' },
};

const EditReenvioModal = ({ reporte, onSave, onCancel }) => {
  const [form, setForm] = useState({
    titulo: reporte.titulo,
    descripcion: reporte.descripcion,
    direccion_referencia: reporte.direccion_referencia ?? '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={em.overlay} onClick={onCancel}>
      <form style={em.modal} onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
        <div style={em.header}>
          <h3 style={em.title}>Editar y reenviar reporte</h3>
          <button type="button" onClick={onCancel} style={em.closeBtn}><X size={18} strokeWidth={2} /></button>
        </div>
        <p style={em.hint}>Corrige los campos necesarios y luego reenvía para revisión.</p>
        {[
          { name: 'titulo',               label: 'Título',               rows: 1 },
          { name: 'descripcion',          label: 'Descripción',          rows: 3 },
          { name: 'direccion_referencia', label: 'Dirección referencia',  rows: 1, optional: true },
        ].map(({ name, label, rows, optional }) => (
          <div key={name} style={em.field}>
            <label style={em.label}>{label}{optional && <span style={em.opt}> (opcional)</span>}</label>
            {rows > 1
              ? <textarea name={name} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} rows={rows} style={em.input} />
              : <input    name={name} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} style={em.input} />
            }
          </div>
        ))}
        <div style={em.actions}>
          <button type="button" onClick={onCancel} style={em.cancelBtn}>Cancelar</button>
          <button type="submit" disabled={saving} style={{ ...em.saveBtn, opacity: saving ? 0.7 : 1 }}>
            <RotateCcw size={15} strokeWidth={2.5} />
            {saving ? 'Reenviando...' : 'Guardar y reenviar'}
          </button>
        </div>
      </form>
    </div>
  );
};

const em = {
  overlay:  { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
  modal:    { background: 'var(--c-surface)', borderRadius: '16px', padding: '24px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: '14px' },
  header:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title:    { margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--c-text)' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--c-text-2)', padding: '4px' },
  hint:     { margin: 0, fontSize: '13px', color: '#7f1d1d', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', lineHeight: '1.5' },
  field:    { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:    { fontSize: '13px', fontWeight: '600', color: 'var(--c-text)' },
  opt:      { fontWeight: '400', color: 'var(--c-text-3)' },
  input:    { border: '1px solid var(--c-border)', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', fontFamily: 'inherit', color: 'var(--c-text)', outline: 'none', resize: 'vertical' },
  actions:  { display: 'flex', gap: '10px', marginTop: '4px' },
  cancelBtn:{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid var(--c-border)', background: 'var(--c-surface)', fontSize: '14px', fontWeight: '600', color: 'var(--c-text-2)', cursor: 'pointer', fontFamily: 'inherit' },
  saveBtn:  { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '11px', borderRadius: '8px', border: 'none', background: '#2563eb', fontSize: '14px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'inherit' },
};

export default ReportDetailPage;
