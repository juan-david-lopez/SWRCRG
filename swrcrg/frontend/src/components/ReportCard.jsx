import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, User, Calendar, ImageOff, ThumbsUp } from 'lucide-react';
import { STATUS_COLORS } from '../constants/reportStatus';
import { voteReport } from '../services/report.service';
import { useAuth } from '../context/AuthContext';
import { toast } from './Toast';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

const STATUS_LABEL = { pendiente: 'Pendiente', en_proceso: 'En proceso', resuelto: 'Resuelto' };

const ReportCard = ({ report }) => {
  const { user } = useAuth();
  const [votos, setVotos]   = useState(report.votos ?? 0);
  const [voted, setVoted]   = useState(report.voted ?? false);

  const handleVote = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Debes iniciar sesión para votar');
    try {
      const res = await voteReport(report.id);
      setVotos(res.votos);
      setVoted(res.voted);
    } catch (err) {
      toast.error(err.message);
    }
  };
  const estadoNombre = report.estado?.nombre ?? report.status ?? '';
  const badge  = STATUS_COLORS[estadoNombre] || {};
  const autor  = report.usuario
    ? `${report.usuario.nombre} ${report.usuario.apellido}`
    : null;
  const img    = report.imagenes?.[0]?.url_imagen;
  const lat    = report.latitud  ?? report.latitude;
  const lng    = report.longitud ?? report.longitude;

  return (
    <div style={s.card}>
      {/* imagen */}
      <div style={s.imgWrap}>
        {img
          ? <img src={img} alt={report.titulo} style={s.img} />
          : (
            <div style={s.imgPlaceholder}>
              <ImageOff size={36} strokeWidth={1.2} color="#94a3b8" />
            </div>
          )
        }
      </div>

      {/* body */}
      <div style={s.body}>
        {/* título + badge */}
        <div style={s.titleRow}>
          <h3 style={s.title}>{report.titulo ?? report.title}</h3>
          {estadoNombre && (
            <span style={{ ...s.badge, ...badge }}>
              {STATUS_LABEL[estadoNombre] ?? estadoNombre}
            </span>
          )}
        </div>

        {/* descripción */}
        <p style={s.desc}>{report.descripcion ?? report.description}</p>

        {/* categoría */}
        {report.categoria && (
          <span style={s.categoria}>{report.categoria.nombre}</span>
        )}

        {/* footer */}
        <div style={s.footer}>
          <div style={s.metaGroup}>
            {autor && (
              <span style={s.metaItem}>
                <User size={12} strokeWidth={2} color="#94a3b8" />
                Por: {autor}
              </span>
            )}
            {lat != null && (
              <span style={s.metaItem}>
                <MapPin size={12} strokeWidth={2} color="#94a3b8" />
                {Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}
                {' · '}
                <Calendar size={12} strokeWidth={2} color="#94a3b8" style={{ marginLeft: '4px' }} />
                {formatDate(report.fecha_reporte ?? report.created_at)}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={handleVote} style={{ ...s.voteBtn, color: voted ? '#2563eb' : '#94a3b8', borderColor: voted ? '#2563eb' : '#e2e8f0' }}>
              <ThumbsUp size={12} strokeWidth={2} />
              {votos}
            </button>
            <Link to={`/reports/${report.id}`} style={s.link}>Ver detalle →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const s = {
  card:           { background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
  imgWrap:        { width: '100%', height: '220px', overflow: 'hidden', flexShrink: 0 },
  img:            { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  imgPlaceholder: { width: '100%', height: '100%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  body:           { padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px' },
  titleRow:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' },
  title:          { margin: 0, fontSize: '17px', fontWeight: '700', color: '#0f172a', lineHeight: '1.3' },
  badge:          { fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.4px' },
  desc:           { margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  categoria:      { fontSize: '12px', fontWeight: '600', color: '#7c3aed', background: '#ede9fe', padding: '3px 10px', borderRadius: '20px', alignSelf: 'flex-start' },
  footer:         { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '4px' },
  metaGroup:      { display: 'flex', flexDirection: 'column', gap: '4px' },
  metaItem:       { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#94a3b8' },
  link:           { fontSize: '13px', fontWeight: '600', color: '#2563eb', textDecoration: 'none', whiteSpace: 'nowrap' },
  voteBtn:        { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '3px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'inherit' },
};

export default ReportCard;
