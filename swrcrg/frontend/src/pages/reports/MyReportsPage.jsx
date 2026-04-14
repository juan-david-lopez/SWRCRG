import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Home, Plus, History, User, MapPin, Calendar, Flag, ImageOff } from 'lucide-react';
import { getMyReports } from '../../services/report.service';
import { useAuth } from '../../context/AuthContext';
import { STATUS_COLORS } from '../../constants/reportStatus';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

const STATUS_LABEL = { pendiente: 'PENDIENTE', en_proceso: 'EN PROCESO', resuelto: 'RESUELTO' };

/* ── Card horizontal ── */
const MyReportCard = ({ report }) => {
  const estado = report.estado?.nombre ?? '';
  const badge  = STATUS_COLORS[estado] || {};
  const img    = report.imagenes?.[0]?.url_imagen;
  const dir    = report.direccion_referencia;

  return (
    <div style={s.card}>
      {/* thumbnail */}
      <div style={s.thumb}>
        {img
          ? <img src={img} alt={report.titulo} style={s.thumbImg} />
          : <div style={s.thumbPlaceholder}><ImageOff size={24} strokeWidth={1.2} color="#94a3b8" /></div>
        }
      </div>

      {/* content */}
      <div style={s.cardBody}>
        <div style={s.cardTop}>
          <h3 style={s.cardTitle}>{report.titulo}</h3>
          {estado && (
            <span style={{ ...s.badge, ...badge }}>{STATUS_LABEL[estado] ?? estado}</span>
          )}
        </div>

        <p style={s.cardDesc}>{report.descripcion}</p>

        {report.categoria && (
          <span style={s.categoria}>{report.categoria.nombre.replace(/_/g, ' ')}</span>
        )}

        <div style={s.cardFooter}>
          <div style={s.metaRow}>
            {dir && (
              <span style={s.metaItem}>
                <MapPin size={12} strokeWidth={2} color="#94a3b8" />
                {dir}
              </span>
            )}
            <span style={s.metaItem}>
              <Calendar size={12} strokeWidth={2} color="#94a3b8" />
              {formatDate(report.fecha_reporte ?? report.created_at)}
            </span>
          </div>
          <Link to={`/reports/${report.id}`} style={s.detailLink}>Ver detalle →</Link>
        </div>
      </div>
    </div>
  );
};

/* ── Empty state ── */
const EmptyState = ({ onCreateClick }) => (
  <div style={s.emptyWrap}>
    <div style={s.emptyCard}>
      <div style={s.emptyIcon}>
        <Flag size={28} strokeWidth={2} color="#1e293b" />
      </div>
      <h3 style={s.emptyTitle}>Sin reportes aún</h3>
      <p style={s.emptyDesc}>No has creado ningún reporte todavía.</p>
      <button onClick={onCreateClick} style={s.emptyBtn}>
        <Plus size={16} strokeWidth={2.5} />
        Crear tu primer reporte
      </button>
    </div>
  </div>
);

/* ── Main ── */
const MyReportsPage = () => {
  const { user, logout }          = useAuth();
  const navigate                  = useNavigate();
  const [reports, setReports]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    getMyReports()
      .then(({ reportes }) => setReports(reportes))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const initials = user ? `${user.nombre?.[0] ?? ''}${user.apellido?.[0] ?? ''}`.toUpperCase() : '';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={s.page}>

      {/* ── Top bar ── */}
      <div style={s.topBar}>
        <span style={s.topTitle}>Mis reportes</span>
        <div style={s.topRight}>
          <button style={s.iconBtn} title="Notificaciones">
            <Bell size={18} strokeWidth={1.8} color="#1e293b" />
          </button>
          <div style={s.avatar}>{initials}</div>
          <button onClick={handleLogout} style={s.logoutBtn}>
            <LogOut size={15} strokeWidth={2} />
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={s.content}>
        {loading && <p style={s.center}>Cargando tus reportes...</p>}
        {error   && <p style={{ ...s.center, color: '#dc2626' }}>{error}</p>}

        {!loading && !error && reports.length === 0 && (
          <EmptyState onCreateClick={() => navigate('/reports/create')} />
        )}

        {!loading && !error && reports.length > 0 && (
          <>
            <h2 style={s.sectionTitle}>Tus reportes</h2>
            <div style={s.list}>
              {reports.map((r) => <MyReportCard key={r.id} report={r} />)}
            </div>
          </>
        )}
      </div>

      {/* ── Bottom nav ── */}
      <nav style={s.bottomNav}>
        <NavItem icon={<Home size={20} strokeWidth={1.8} />}    label="Inicio"    onClick={() => navigate('/')} />
        <NavItem icon={<Plus size={20} strokeWidth={1.8} />}    label="Reportar"  onClick={() => navigate('/reports/create')} />
        <NavItem icon={<History size={20} strokeWidth={1.8} />} label="Historial" onClick={() => {}} active />
        <NavItem icon={<User size={20} strokeWidth={1.8} />}    label="Perfil"    onClick={() => {}} />
      </nav>

    </div>
  );
};

const NavItem = ({ icon, label, onClick, active }) => (
  <button onClick={onClick} style={{ ...s.navItem, background: active ? '#eff6ff' : 'transparent' }}>
    <span style={{ color: active ? '#2563eb' : '#64748b' }}>{icon}</span>
    <span style={{ ...s.navLabel, color: active ? '#2563eb' : '#64748b', fontWeight: active ? '700' : '500' }}>{label}</span>
  </button>
);

const s = {
  page:        { minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", display: 'flex', flexDirection: 'column' },

  /* top bar */
  topBar:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', background: '#fff', borderBottom: '1px solid #e2e8f0', flexShrink: 0 },
  topTitle:    { fontSize: '17px', fontWeight: '700', color: '#0f172a' },
  topRight:    { display: 'flex', alignItems: 'center', gap: '12px' },
  iconBtn:     { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' },
  avatar:      { width: '34px', height: '34px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700' },
  logoutBtn:   { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#ef4444' },

  /* content */
  content:     { flex: 1, maxWidth: '720px', width: '100%', margin: '0 auto', padding: '28px 20px 100px' },
  sectionTitle:{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 20px' },
  list:        { display: 'flex', flexDirection: 'column', gap: '16px' },
  center:      { textAlign: 'center', marginTop: '80px', color: '#94a3b8' },

  /* card */
  card:        { background: '#fff', borderRadius: '12px', display: 'flex', gap: '0', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  thumb:       { width: '140px', flexShrink: 0 },
  thumbImg:    { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  thumbPlaceholder: { width: '100%', height: '100%', minHeight: '120px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardBody:    { flex: 1, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '8px' },
  cardTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' },
  cardTitle:   { margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a', lineHeight: '1.3' },
  badge:       { fontSize: '10px', fontWeight: '800', padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0, letterSpacing: '0.5px' },
  cardDesc:    { margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  categoria:   { fontSize: '12px', fontWeight: '600', color: '#ea580c', background: '#fff7ed', padding: '3px 10px', borderRadius: '20px', alignSelf: 'flex-start', border: '1px solid #fed7aa' },
  cardFooter:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '4px' },
  metaRow:     { display: 'flex', flexDirection: 'column', gap: '3px' },
  metaItem:    { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#94a3b8' },
  detailLink:  { fontSize: '13px', fontWeight: '700', color: '#2563eb', textDecoration: 'none', whiteSpace: 'nowrap' },

  /* empty */
  emptyWrap:   { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' },
  emptyCard:   { background: '#fff', borderRadius: '20px', padding: '48px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', maxWidth: '360px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  emptyIcon:   { width: '64px', height: '64px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' },
  emptyTitle:  { fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 },
  emptyDesc:   { fontSize: '14px', color: '#64748b', margin: 0, textAlign: 'center' },
  emptyBtn:    { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', padding: '13px 32px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },

  /* bottom nav */
  bottomNav:   { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-around', padding: '8px 0 12px', zIndex: 100 },
  navItem:     { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', border: 'none', cursor: 'pointer', padding: '6px 20px', borderRadius: '10px' },
  navLabel:    { fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' },
};

export default MyReportsPage;
