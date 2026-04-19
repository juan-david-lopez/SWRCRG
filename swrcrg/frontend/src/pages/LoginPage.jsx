import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, MapPin, BarChart2, Bell } from 'lucide-react';
import { login } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';

const Feature = ({ icon: Icon, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={18} strokeWidth={1.8} color="#fff" />
    </div>
    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.4' }}>{text}</span>
  </div>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const { saveSession } = useAuth();
  const [form, setForm]       = useState({ correo: '', contrasena: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { token, user } = await login(form);
      saveSession(token, user);
      navigate(user.rol === 'administrador' ? '/admin/reports' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      {/* ── Panel izquierdo: formulario ── */}
      <div style={s.formPanel}>
        <div style={s.formInner}>
          <Link to="/" style={s.backLink}>
            <ArrowLeft size={14} strokeWidth={2} /> Volver al inicio
          </Link>

          <div style={{ marginBottom: '32px' }}>
            <span style={s.brand}>SWRCRG</span>
            <h1 style={s.title}>Bienvenido de nuevo</h1>
            <p style={s.subtitle}>Inicia sesión para gestionar tus reportes ciudadanos.</p>
          </div>

          <form onSubmit={handleSubmit} style={s.form} noValidate>
            <div style={s.fieldGroup}>
              <label style={s.label}>Correo electrónico</label>
              <div style={{ ...s.inputWrap, borderColor: error ? '#ef4444' : 'var(--c-border)' }}>
                <Mail size={16} strokeWidth={1.8} color="var(--c-text-3)" style={{ flexShrink: 0 }} />
                <input name="correo" type="email" value={form.correo} placeholder="tu@correo.com"
                  onChange={handleChange} style={s.input} autoComplete="email" />
              </div>
            </div>

            <div style={s.fieldGroup}>
              <label style={s.label}>Contraseña</label>
              <div style={{ ...s.inputWrap, borderColor: error ? '#ef4444' : 'var(--c-border)' }}>
                <Lock size={16} strokeWidth={1.8} color={error ? '#ef4444' : 'var(--c-text-3)'} style={{ flexShrink: 0 }} />
                <input name="contrasena" type={showPwd ? 'text' : 'password'} value={form.contrasena}
                  placeholder="••••••••" onChange={handleChange} style={s.input} autoComplete="current-password" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={s.eyeBtn} tabIndex={-1}>
                  {showPwd ? <EyeOff size={16} color="var(--c-text-3)" /> : <Eye size={16} color="var(--c-text-3)" />}
                </button>
              </div>
              {error && <span style={s.fieldErr}>{error}</span>}
            </div>

            <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Entrando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p style={s.switchText}>
            ¿No tienes cuenta?{' '}
            <Link to="/register" style={s.switchLink}>Regístrate gratis</Link>
          </p>
        </div>
      </div>

      {/* ── Panel derecho: branding ── */}
      <div style={s.brandPanel}>
        <div style={s.brandInner}>
          <div style={s.brandLogo}>SWRCRG</div>
          <h2 style={s.brandTitle}>
            Transforma tu ciudad,<br />un reporte a la vez.
          </h2>
          <p style={s.brandDesc}>
            Únete a la comunidad de ciudadanos que están mejorando su entorno reportando problemas de residuos y servicios urbanos.
          </p>
          <div style={s.features}>
            <Feature icon={MapPin}    text="Geolocaliza problemas en tiempo real" />
            <Feature icon={BarChart2} text="Sigue el progreso de cada reporte" />
            <Feature icon={Bell}      text="Recibe notificaciones de resolución" />
          </div>
          <div style={s.brandStats}>
            <div style={s.stat}>
              <span style={s.statNum}>100%</span>
              <span style={s.statLabel}>Gratuito</span>
            </div>
            <div style={s.statDivider} />
            <div style={s.stat}>
              <span style={s.statNum}>24/7</span>
              <span style={s.statLabel}>Disponible</span>
            </div>
            <div style={s.statDivider} />
            <div style={s.stat}>
              <span style={{ ...s.statNum, fontSize: '14px', fontWeight: '700' }}>COL</span>
              <span style={s.statLabel}>Colombia</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const s = {
  root:        { display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },

  /* Form panel */
  formPanel:   { flex: '0 0 50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-surface)', padding: '40px 24px', overflowY: 'auto' },
  formInner:   { width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '0' },
  backLink:    { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--c-text-3)', textDecoration: 'none', fontWeight: '500', marginBottom: '32px' },
  brand:       { fontSize: '13px', fontWeight: '800', color: '#2563eb', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '12px' },
  title:       { fontSize: '28px', fontWeight: '800', color: 'var(--c-text)', margin: '0 0 8px', lineHeight: '1.2' },
  subtitle:    { fontSize: '15px', color: 'var(--c-text-2)', margin: 0, lineHeight: '1.5' },
  form:        { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' },
  fieldGroup:  { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:       { fontSize: '13px', fontWeight: '600', color: 'var(--c-text)' },
  inputWrap:   { display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid var(--c-border)', borderRadius: '10px', padding: '11px 14px', background: 'var(--c-bg)', transition: 'border-color .15s' },
  input:       { flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: 'var(--c-text)', background: 'transparent', fontFamily: 'inherit' },
  eyeBtn:      { background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' },
  fieldErr:    { fontSize: '12px', color: '#ef4444', margin: 0 },
  btn:         { padding: '13px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', fontFamily: 'inherit', marginTop: '4px' },
  switchText:  { textAlign: 'center', fontSize: '14px', color: 'var(--c-text-2)', margin: 0 },
  switchLink:  { color: '#2563eb', fontWeight: '700', textDecoration: 'none' },

  /* Brand panel */
  brandPanel:  { flex: '0 0 50%', background: 'linear-gradient(145deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 48px', position: 'relative', overflow: 'hidden' },
  brandInner:  { position: 'relative', zIndex: 1, maxWidth: '420px' },
  brandLogo:   { fontSize: '14px', fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '32px' },
  brandTitle:  { fontSize: '36px', fontWeight: '800', color: '#fff', margin: '0 0 16px', lineHeight: '1.15', letterSpacing: '-0.5px' },
  brandDesc:   { fontSize: '15px', color: 'rgba(255,255,255,0.75)', margin: '0 0 40px', lineHeight: '1.7' },
  features:    { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' },
  brandStats:  { display: 'flex', alignItems: 'center', gap: '24px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.2)' },
  stat:        { display: 'flex', flexDirection: 'column', gap: '2px' },
  statNum:     { fontSize: '22px', fontWeight: '800', color: '#fff' },
  statLabel:   { fontSize: '12px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  statDivider: { width: '1px', height: '36px', background: 'rgba(255,255,255,0.2)' },

  /* Responsive: en móvil solo el formulario */
  '@media (max-width: 768px)': { brandPanel: { display: 'none' }, formPanel: { flex: '1' } },
};

export default LoginPage;
