import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, BarChart2, CheckCircle, ImageOff } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getReports } from '../services/report.service';
import { useAuth } from '../context/AuthContext';
import { STATUS_COLORS } from '../constants/reportStatus';
import { TILE_URL, TILE_ATTR, createStatusIcon } from '../components/MapMarkers';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

/* ── helpers ── */
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

const statusLabel = { pendiente: 'Pendiente', en_proceso: 'En proceso', resuelto: 'Resuelto' };

/* ── sub-components ── */
const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div style={s.featureCard}>
    <span style={s.featureIcon}><Icon size={28} strokeWidth={1.5} color="#2563eb" /></span>
    <h3 style={s.featureTitle}>{title}</h3>
    <p style={s.featureDesc}>{desc}</p>
  </div>
);

const MiniReportCard = ({ report }) => {
  const estado = report.estado?.nombre ?? '';
  const badge  = STATUS_COLORS[estado] || {};
  const rawImg = report.imagenes?.[0]?.url_imagen;
  const img    = rawImg ? `${API_BASE}${rawImg}` : null;

  return (
    <Link to={`/reports/${report.id}`} style={s.miniCard}>
      <div style={{ ...s.miniImg, background: img ? 'transparent' : 'var(--c-text)' }}>
        {img
          ? <img src={img} alt={report.titulo} style={s.miniImgEl} />
          : <ImageOff size={32} strokeWidth={1.5} color="#94a3b8" />
        }
      </div>
      <div style={s.miniBody}>
        {estado && (
          <span style={{ ...s.miniBadge, ...badge }}>{statusLabel[estado] ?? estado}</span>
        )}
        <p style={s.miniTitle}>{report.titulo}</p>
        <p style={s.miniMeta}>
          {report.categoria?.nombre && <span>{report.categoria.nombre} · </span>}
          {formatDate(report.fecha_reporte ?? report.created_at)}
        </p>
      </div>
    </Link>
  );
};

/* ── main component ── */
const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getReports()
      .then(({ reportes }) => setReports(reportes ?? []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  const recent   = reports.slice(0, 4);
  const total    = reports.length;
  const resueltos = reports.filter((r) => r.estado?.nombre === 'resuelto').length;

  return (
    <div style={s.page}>

      {/* ── HERO ── */}
      <section style={s.hero}>
        <div style={s.heroInner}>
          <h1 style={s.heroTitle}>SWRCRG</h1>
          <p style={s.heroSub}>
            Sistema de reportes ciudadanos para una ciudad más limpia y sostenible
          </p>
          <div style={s.heroBtns}>
            <button onClick={() => navigate('/reports')} style={s.btnPrimary}>
              Ver reportes
            </button>
            {!user && (
              <button onClick={() => navigate('/register')} style={s.btnOutline}>
                Registrarse
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={s.features}>
        <div style={s.container}>
          <div style={s.featuresGrid}>
            <FeatureCard
              icon={Bell}
              title="Reporte Instantáneo"
              desc="Geolocalización automática para identificar puntos críticos de residuos en tiempo real."
            />
            <FeatureCard
              icon={BarChart2}
              title="Impacto Comunitario"
              desc="Visualiza estadísticas y el avance de limpieza en tu municipio con transparencia total."
            />
            <FeatureCard
              icon={CheckCircle}
              title="Acción Confirmada"
              desc="Seguimiento punto a punto desde el envío del reporte hasta la resolución por las autoridades."
            />
          </div>
        </div>
      </section>

      {/* ── STATS / MAP SECTION ── */}
      <section style={s.statsSection}>
        <div style={{ ...s.container, ...s.statsInner }}>
          <div style={s.statsLeft}>
            <p style={s.statsEyebrow}>MAPA DE TU ZONA</p>
            <h2 style={s.statsTitle}>Explora la actividad de tu zona.</h2>
            <p style={s.statsDesc}>
              Nuestra comunidad ha mapeado más de {total > 0 ? total : '—'} incidencias este mes.
              Únete al cambio y ayuda a mejorar las cifras, ¡cada reporte hace la diferencia!
            </p>
            <div style={s.statsNumbers}>
              <div style={s.statItem}>
                <span style={s.statNum}>{resueltos > 0 ? `${Math.round((resueltos / total) * 100)}%` : '—'}</span>
                <span style={s.statLabel}>RESUELTOS</span>
              </div>
              <div style={s.statItem}>
                <span style={s.statNum}>{total > 0 ? total : '—'}</span>
                <span style={s.statLabel}>REPORTES</span>
              </div>
            </div>
          </div>
          <div style={s.mapCard}>
            {!loading && reports.length > 0 ? (
              <MapContainer
                center={[
                  reports.reduce((sum, r) => sum + parseFloat(r.latitud), 0) / reports.length,
                  reports.reduce((sum, r) => sum + parseFloat(r.longitud), 0) / reports.length,
                ]}
                zoom={13}
                style={{ height: '100%', width: '100%', borderRadius: '16px' }}
                scrollWheelZoom={false}
                zoomControl={false}
              >
                <TileLayer url={TILE_URL} attribution={TILE_ATTR} />
                {reports.map((r) => (
                  <Marker
                    key={r.id}
                    position={[parseFloat(r.latitud), parseFloat(r.longitud)]}
                    icon={createStatusIcon(r.estado?.nombre, 14)}
                  >
                    <Popup>
                      <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", minWidth: '150px', padding: '2px 0' }}>
                        <strong style={{ fontSize: '13px', color: 'var(--c-text)', display: 'block', marginBottom: '4px' }}>{r.titulo}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--c-text-2)' }}>{r.categoria?.nombre?.replace(/_/g, ' ')}</span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div style={s.mapPlaceholder}>
                <p style={s.mapLabel}>{loading ? 'Cargando mapa...' : 'Sin reportes aún'}</p>
                <p style={s.mapSub}>Los reportes aparecerán aquí</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── RECENT REPORTS ── */}
      <section style={s.recentSection}>
        <div style={s.container}>
          <h2 style={s.sectionTitle}>Reportes Recientes</h2>
          {loading ? (
            <p style={s.loadingText}>Cargando reportes...</p>
          ) : recent.length === 0 ? (
            <p style={s.loadingText}>Aún no hay reportes registrados.</p>
          ) : (
            <div style={s.recentGrid}>
              {recent.map((r) => <MiniReportCard key={r.id} report={r} />)}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link to="/reports" style={s.seeAllLink}>Ver todos los reportes →</Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={s.cta}>
        <div style={s.ctaInner}>
          <h2 style={s.ctaTitle}>¿Ves algo que no debería estar ahí?</h2>
          <p style={s.ctaDesc}>
            Únete a los miles de ciudadanos que ya están mejorando su entorno.
            Solo toma un momento. El Congreso realiza tu primer reporte.
          </p>
          <div style={s.ctaBtns}>
            <button onClick={() => navigate(user ? '/reports/create' : '/register')} style={s.btnPrimary}>
              Reportar ahora
            </button>
            <button onClick={() => navigate('/reports')} style={s.btnOutlineWhite}>
              Explorar reportes
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={s.footer}>
        <div style={{ ...s.container, ...s.footerInner }}>
          <div style={s.footerBrand}>
            <span style={s.footerLogo}>SWRCRG</span>
            <p style={s.footerTagline}>
              Transformando la gestión urbana a través de la participación ciudadana y la tecnología cívica.
            </p>
          </div>
          <div style={s.footerLinks}>
            <div>
              <p style={s.footerColTitle}>Plataforma</p>
              <Link to="/reports" style={s.footerLink}>Ver reportes</Link>
              <Link to="/reports/create" style={s.footerLink}>Crear reporte</Link>
              <Link to="/mis-reportes" style={s.footerLink}>Estadísticas</Link>
              <Link to="/login" style={s.footerLink}>Administrar</Link>
            </div>
            <div>
              <p style={s.footerColTitle}>Cuenta</p>
              <Link to="/register" style={s.footerLink}>Crear cuenta</Link>
              <Link to="/login" style={s.footerLink}>Iniciar sesión</Link>
              <Link to="/mis-reportes" style={s.footerLink}>Mis reportes</Link>
              <Link to="/perfil" style={s.footerLink}>Perfil</Link>
            </div>
            <div>
              <p style={s.footerColTitle}>Legal</p>
              <Link to="/privacidad" style={s.footerLink}>Privacidad</Link>
              <Link to="/terminos"   style={s.footerLink}>Términos</Link>
              <Link to="/cookies"    style={s.footerLink}>Cookies</Link>
            </div>
          </div>
        </div>
        <div style={s.footerBottom}>
          <p>© {new Date().getFullYear()} SWRCRG · Todos los derechos reservados</p>
        </div>
      </footer>

    </div>
  );
};

/* ── styles ── */
const s = {
  page: { width: '100%', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: 'var(--c-text)', overflowX: 'hidden' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px' },

  /* hero */
  hero: { background: 'linear-gradient(135deg, #e8edf5 0%, #d1dce8 100%)', padding: '100px 24px 80px', textAlign: 'center' },
  heroInner: { maxWidth: '640px', margin: '0 auto' },
  heroTitle: { fontSize: '56px', fontWeight: '700', letterSpacing: '-2px', margin: '0 0 16px', color: '#0f172a' },
  heroSub: { fontSize: '18px', color: '#475569', margin: '0 0 36px', lineHeight: '1.6' },
  heroBtns: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
  btnPrimary: { padding: '12px 28px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  btnOutline: { padding: '12px 28px', background: 'transparent', color: '#2563eb', border: '2px solid #2563eb', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },

  /* features */
  features: { padding: '64px 0', background: 'var(--c-surface)' },
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' },
  featureCard: { padding: '28px 24px', borderRadius: '12px', border: '1px solid var(--c-border)', background: 'var(--c-surface)', textAlign: 'left' },
  featureIcon: { fontSize: '28px', display: 'block', marginBottom: '12px' },
  featureTitle: { fontSize: '16px', fontWeight: '600', margin: '0 0 8px', color: 'var(--c-text)' },
  featureDesc: { fontSize: '14px', color: 'var(--c-text-2)', margin: 0, lineHeight: '1.6' },

  /* stats */
  statsSection: { padding: '72px 0', background: 'var(--c-bg)' },
  statsInner: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' },
  statsLeft: { textAlign: 'left' },
  statsEyebrow: { fontSize: '12px', fontWeight: '700', letterSpacing: '1.5px', color: '#2563eb', margin: '0 0 12px', textTransform: 'uppercase' },
  statsTitle: { fontSize: '36px', fontWeight: '700', margin: '0 0 16px', color: 'var(--c-text)', lineHeight: '1.2' },
  statsDesc: { fontSize: '15px', color: 'var(--c-text-2)', margin: '0 0 32px', lineHeight: '1.7' },
  statsNumbers: { display: 'flex', gap: '40px' },
  statItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
  statNum: { fontSize: '32px', fontWeight: '700', color: 'var(--c-text)' },
  statLabel: { fontSize: '11px', fontWeight: '600', letterSpacing: '1px', color: 'var(--c-text-3)', textTransform: 'uppercase' },
  mapCard: { background: 'var(--c-border)', borderRadius: '16px', minHeight: '280px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  mapPlaceholder: { textAlign: 'center', color: 'var(--c-text-3)' },
  mapLabel: { fontSize: '16px', fontWeight: '600', margin: '0 0 4px', color: 'var(--c-text-2)' },
  mapSub: { fontSize: '13px', margin: 0 },

  /* recent */
  recentSection: { padding: '72px 0', background: 'var(--c-surface)' },
  sectionTitle: { fontSize: '28px', fontWeight: '700', textAlign: 'center', margin: '0 0 40px', color: 'var(--c-text)' },
  recentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' },
  loadingText: { textAlign: 'center', color: 'var(--c-text-3)', fontSize: '15px' },
  seeAllLink: { color: '#2563eb', textDecoration: 'none', fontWeight: '600', fontSize: '15px' },

  /* mini card */
  miniCard: { borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--c-border)', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', transition: 'box-shadow .2s' },
  miniImg: { height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  miniImgEl: { width: '100%', height: '100%', objectFit: 'cover' },
  miniBody: { padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px' },
  miniBadge: { fontSize: '11px', padding: '2px 8px', borderRadius: '20px', alignSelf: 'flex-start', fontWeight: '600' },
  miniTitle: { fontSize: '14px', fontWeight: '600', margin: 0, color: 'var(--c-text)', lineHeight: '1.4' },
  miniMeta: { fontSize: '12px', color: 'var(--c-text-3)', margin: 0 },

  /* cta */
  cta: { background: '#2563eb', padding: '80px 24px', textAlign: 'center' },
  ctaInner: { maxWidth: '600px', margin: '0 auto' },
  ctaTitle: { fontSize: '32px', fontWeight: '700', color: '#fff', margin: '0 0 16px' },
  ctaDesc: { fontSize: '16px', color: '#bfdbfe', margin: '0 0 36px', lineHeight: '1.7' },
  ctaBtns: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
  btnOutlineWhite: { padding: '12px 28px', background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.5)', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },

  /* footer */
  footer: { background: '#0f172a', color: 'var(--c-text-3)', padding: '56px 0 0' },
  footerInner: { display: 'grid', gridTemplateColumns: '1.5fr 2fr', gap: '48px', paddingBottom: '48px' },
  footerBrand: { textAlign: 'left' },
  footerLogo: { fontSize: '20px', fontWeight: '700', color: '#f1f5f9', display: 'block', marginBottom: '12px' },
  footerTagline: { fontSize: '14px', lineHeight: '1.7', margin: 0 },
  footerLinks: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', textAlign: 'left' },
  footerColTitle: { fontSize: '13px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  footerLink: { display: 'block', fontSize: '14px', color: 'var(--c-text-3)', textDecoration: 'none', marginBottom: '8px', cursor: 'pointer' },
  footerBottom: { borderTop: '1px solid var(--c-text)', padding: '20px 24px', textAlign: 'center', fontSize: '13px' },
};

export default Home;
