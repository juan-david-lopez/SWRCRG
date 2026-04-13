import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { login } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const LoginPage = () => {
  const navigate = useNavigate();
  const { saveSession } = useAuth();
  const [form, setForm]       = useState({ correo: '', contrasena: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
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
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", minHeight: '100vh', background: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={s.page}>
        <form onSubmit={handleSubmit} style={s.card} noValidate>

          <Link to="/" style={s.backLink}>
            <ArrowLeft size={15} strokeWidth={2} />
            Volver al inicio
          </Link>

          <h2 style={s.title}>Iniciar sesión</h2>

          {/* Correo */}
          <div style={{ ...s.inputWrap, borderColor: error ? '#ef4444' : '#d1d5db' }}>
            <Mail size={16} strokeWidth={1.8} color="#9ca3af" style={{ flexShrink: 0 }} />
            <input
              name="correo" type="email" value={form.correo}
              placeholder="Correo" onChange={handleChange}
              style={s.input} autoComplete="email"
            />
          </div>

          {/* Contraseña */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ ...s.inputWrap, borderColor: error ? '#ef4444' : '#d1d5db' }}>
              <Lock size={16} strokeWidth={1.8} color={error ? '#ef4444' : '#9ca3af'} style={{ flexShrink: 0 }} />
              <input
                name="contrasena" type={showPwd ? 'text' : 'password'} value={form.contrasena}
                placeholder="Contraseña" onChange={handleChange}
                style={s.input} autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={s.eyeBtn} tabIndex={-1}>
                {showPwd ? <EyeOff size={16} color="#9ca3af" /> : <Eye size={16} color="#9ca3af" />}
              </button>
            </div>
            {error && <span style={s.fieldErr}>{error}</span>}
          </div>

          <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <p style={s.registerLink}>
            ¿No tienes cuenta? <Link to="/register" style={s.registerAnchor}>Regístrate</Link>
          </p>

        </form>
      </div>
    </div>
  );
};

const s = {
  page:          { display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, padding: '32px 16px' },
  card:          { display: 'flex', flexDirection: 'column', gap: '14px', background: '#fff', padding: '36px 32px', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  backLink:      { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b', textDecoration: 'none', fontWeight: '500', marginBottom: '4px' },
  title:         { margin: '0 0 8px', fontSize: '24px', fontWeight: '700', color: '#0f172a' },
  inputWrap:     { display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px 14px', background: '#fff', transition: 'border-color .15s' },
  input:         { flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: '#0f172a', background: 'transparent', fontFamily: 'inherit' },
  eyeBtn:        { background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' },
  fieldErr:      { fontSize: '12px', color: '#ef4444', margin: 0 },
  btn:           { padding: '13px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', fontFamily: 'inherit', marginTop: '4px' },
  registerLink:  { textAlign: 'center', fontSize: '13px', margin: 0, color: '#64748b' },
  registerAnchor:{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' },
};

export default LoginPage;
