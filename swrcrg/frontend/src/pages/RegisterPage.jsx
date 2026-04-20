import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { register } from '../services/auth.service';
import { toast } from '../components/Toast';

const INITIAL = { nombre: '', apellido: '', correo: '', contrasena: '', confirmar: '', telefono: '' };

const validate = ({ nombre, apellido, correo, contrasena, confirmar }) => {
  if (!nombre.trim())   return 'El nombre es obligatorio';
  if (nombre.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) return 'El nombre solo puede contener letras';
  if (!apellido.trim()) return 'El apellido es obligatorio';
  if (apellido.trim().length < 2) return 'El apellido debe tener al menos 2 caracteres';
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellido)) return 'El apellido solo puede contener letras';
  if (!correo.trim())   return 'El correo es obligatorio';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return 'Formato de correo inválido';
  if (!contrasena)      return 'La contraseña es obligatoria';
  if (contrasena.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
  if (!/[A-Z]/.test(contrasena)) return 'La contraseña debe tener al menos una mayúscula';
  if (!/[0-9]/.test(contrasena)) return 'La contraseña debe tener al menos un número';
  if (contrasena !== confirmar) return 'Las contraseñas no coinciden';
  return null;
};

const passwordStrength = (pwd) => {
  let s = 0;
  if (pwd.length >= 6)          s++;
  if (pwd.length >= 10)         s++;
  if (/[A-Z]/.test(pwd))        s++;
  if (/[0-9]/.test(pwd))        s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
};

const STRENGTH_LABEL = ['', 'Débil', 'Regular', 'Buena', 'Fuerte', 'Muy fuerte'];
const STRENGTH_COLOR = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];

const Benefit = ({ text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <CheckCircle size={16} strokeWidth={2} color="rgba(255,255,255,0.9)" style={{ flexShrink: 0 }} />
    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>{text}</span>
  </div>
);

const IconInput = ({ icon: Icon, name, type = 'text', value, placeholder, onChange, onBlur, error, hint, right }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${error ? '#ef4444' : 'var(--c-border)'}`, borderRadius: '10px', padding: '11px 14px', background: 'var(--c-bg)', transition: 'border-color .15s' }}>
      <Icon size={16} strokeWidth={1.8} color={error ? '#ef4444' : 'var(--c-text-3)'} style={{ flexShrink: 0 }} />
      <input name={name} type={type} value={value} placeholder={placeholder}
        onChange={onChange} onBlur={onBlur}
        style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: 'var(--c-text)', background: 'transparent', fontFamily: 'inherit' }}
        autoComplete={type === 'password' ? 'new-password' : 'off'} />
      {right}
    </div>
    {hint && !error && <span style={{ fontSize: '12px', color: 'var(--c-text-3)', margin: 0 }}>{hint}</span>}
    {error && <span style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>{error}</span>}
  </div>
);

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm]         = useState(INITIAL);
  const [touched, setTouched]   = useState({});
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [showConf, setShowConf] = useState(false);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };
  const handleBlur   = (e) => setTouched({ ...touched, [e.target.name]: true });

  const fieldError = (field) => {
    if (!touched[field]) return '';
    const val = form[field];
    if (field === 'nombre')    { if (!val.trim()) return 'Obligatorio'; if (val.trim().length < 2) return 'Mínimo 2 caracteres'; if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val)) return 'Solo letras'; }
    if (field === 'apellido')  { if (!val.trim()) return 'Obligatorio'; if (val.trim().length < 2) return 'Mínimo 2 caracteres'; if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val)) return 'Solo letras'; }
    if (field === 'correo')    { if (!val.trim()) return 'Obligatorio'; if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Correo inválido'; }
    if (field === 'contrasena'){ if (!val) return 'Obligatorio'; if (val.length < 6) return 'Mínimo 6 caracteres'; if (!/[A-Z]/.test(val)) return 'Falta una mayúscula'; if (!/[0-9]/.test(val)) return 'Falta un número'; }
    if (field === 'confirmar') { if (val !== form.contrasena) return 'Las contraseñas no coinciden'; }
    if (field === 'telefono')  { if (val && !/^[0-9+\-\s()]{7,20}$/.test(val)) return 'Formato inválido'; }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ nombre: true, apellido: true, correo: true, contrasena: true, confirmar: true, telefono: true });
    const err = validate(form);
    if (err) return setError(err);
    setError(''); setLoading(true);
    try {
      const { nombre, apellido, correo, contrasena, telefono } = form;
      await register({ nombre, apellido, correo, contrasena, telefono });
      toast.success('¡Cuenta creada exitosamente!');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength(form.contrasena);
  const eyeBtn = { background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' };

  return (
    <div style={s.root}>
      {/* ── Panel izquierdo: branding ── */}
      <div style={s.brandPanel}>
        <div style={s.brandInner}>
          <div style={s.brandLogo}>SWRCRG</div>
          <h2 style={s.brandTitle}>
            Sé parte del<br />cambio ciudadano.
          </h2>
          <p style={s.brandDesc}>
            Crea tu cuenta gratuita y empieza a reportar problemas en tu comunidad. Juntos construimos una ciudad más limpia y sostenible.
          </p>
          <div style={s.benefits}>
            <Benefit text="Registro gratuito, sin tarjeta de crédito" />
            <Benefit text="Reporta desde cualquier dispositivo" />
            <Benefit text="Seguimiento en tiempo real de tus reportes" />
            <Benefit text="Notificaciones cuando se resuelvan tus reportes" />
            <Benefit text="Tus datos protegidos bajo la Ley 1581 de 2012" />
          </div>
          <div style={s.testimonial}>
            <p style={s.testimonialText}>
              "Gracias a SWRCRG, el problema de basura en mi barrio fue resuelto en menos de una semana."
            </p>
            <span style={s.testimonialAuthor}>— Ciudadano de Armenia, Colombia</span>
          </div>
        </div>
      </div>

      {/* ── Panel derecho: formulario ── */}
      <div style={s.formPanel}>
        <div style={s.formInner}>
          <Link to="/" style={s.backLink}>
            <ArrowLeft size={14} strokeWidth={2} /> Volver al inicio
          </Link>

          <div style={{ marginBottom: '28px' }}>
            <span style={s.brand}>SWRCRG</span>
            <h1 style={s.title}>Crear cuenta</h1>
            <p style={s.subtitle}>Únete a la comunidad ciudadana.</p>
          </div>

          <form onSubmit={handleSubmit} style={s.form} noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <IconInput icon={User} name="nombre"   value={form.nombre}   placeholder="Nombre"   onChange={handleChange} onBlur={handleBlur} error={fieldError('nombre')} />
              <IconInput icon={User} name="apellido" value={form.apellido} placeholder="Apellido" onChange={handleChange} onBlur={handleBlur} error={fieldError('apellido')} />
            </div>

            <IconInput icon={Mail} name="correo" value={form.correo} placeholder="Correo electrónico" onChange={handleChange} onBlur={handleBlur} error={fieldError('correo')} type="email" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${fieldError('contrasena') ? '#ef4444' : 'var(--c-border)'}`, borderRadius: '10px', padding: '11px 14px', background: 'var(--c-bg)' }}>
                <Lock size={16} strokeWidth={1.8} color={fieldError('contrasena') ? '#ef4444' : 'var(--c-text-3)'} style={{ flexShrink: 0 }} />
                <input name="contrasena" type={showPwd ? 'text' : 'password'} value={form.contrasena} placeholder="Contraseña"
                  onChange={handleChange} onBlur={handleBlur}
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: 'var(--c-text)', background: 'transparent', fontFamily: 'inherit' }}
                  autoComplete="new-password" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={eyeBtn} tabIndex={-1}>
                  {showPwd ? <EyeOff size={16} color="var(--c-text-3)" /> : <Eye size={16} color="var(--c-text-3)" />}
                </button>
              </div>
              {form.contrasena && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, height: '4px', background: 'var(--c-border)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(strength / 5) * 100}%`, background: STRENGTH_COLOR[strength], borderRadius: '2px', transition: 'width .3s, background .3s' }} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: STRENGTH_COLOR[strength], whiteSpace: 'nowrap' }}>{STRENGTH_LABEL[strength]}</span>
                </div>
              )}
              {fieldError('contrasena') && <span style={{ fontSize: '12px', color: '#ef4444' }}>{fieldError('contrasena')}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${fieldError('confirmar') ? '#ef4444' : 'var(--c-border)'}`, borderRadius: '10px', padding: '11px 14px', background: 'var(--c-bg)' }}>
                <Lock size={16} strokeWidth={1.8} color={fieldError('confirmar') ? '#ef4444' : 'var(--c-text-3)'} style={{ flexShrink: 0 }} />
                <input name="confirmar" type={showConf ? 'text' : 'password'} value={form.confirmar} placeholder="Confirmar contraseña"
                  onChange={handleChange} onBlur={handleBlur}
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: 'var(--c-text)', background: 'transparent', fontFamily: 'inherit' }}
                  autoComplete="new-password" />
                <button type="button" onClick={() => setShowConf(!showConf)} style={eyeBtn} tabIndex={-1}>
                  {showConf ? <EyeOff size={16} color="var(--c-text-3)" /> : <Eye size={16} color="var(--c-text-3)" />}
                </button>
              </div>
              {fieldError('confirmar') && <span style={{ fontSize: '12px', color: '#ef4444' }}>{fieldError('confirmar')}</span>}
            </div>

            <IconInput icon={Phone} name="telefono" value={form.telefono} placeholder="Teléfono (opcional)" onChange={handleChange} onBlur={handleBlur} error={fieldError('telefono')} hint="Opcional" />

            {error && <p style={s.errorBox}>{error}</p>}

            <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
          </form>

          <p style={s.switchText}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={s.switchLink}>Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const s = {
  root:        { display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },

  /* Brand panel (izquierdo) */
  brandPanel:  { flex: '0 0 45%', background: 'linear-gradient(145deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 48px', position: 'relative', overflow: 'hidden' },
  brandInner:  { position: 'relative', zIndex: 1, maxWidth: '400px' },
  brandLogo:   { fontSize: '13px', fontWeight: '800', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '28px', display: 'block' },
  brandTitle:  { fontSize: '34px', fontWeight: '800', color: '#fff', margin: '0 0 16px', lineHeight: '1.15', letterSpacing: '-0.5px' },
  brandDesc:   { fontSize: '15px', color: 'rgba(255,255,255,0.7)', margin: '0 0 36px', lineHeight: '1.7' },
  benefits:    { display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '40px' },
  testimonial: { background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px', borderLeft: '3px solid rgba(255,255,255,0.3)' },
  testimonialText:   { fontSize: '14px', color: 'rgba(255,255,255,0.85)', margin: '0 0 8px', lineHeight: '1.6', fontStyle: 'italic' },
  testimonialAuthor: { fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' },

  /* Form panel (derecho) */
  formPanel:   { flex: '0 0 55%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-surface)', padding: '40px 24px', overflowY: 'auto' },
  formInner:   { width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '0' },
  backLink:    { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--c-text-3)', textDecoration: 'none', fontWeight: '500', marginBottom: '28px' },
  brand:       { fontSize: '13px', fontWeight: '800', color: '#2563eb', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '10px' },
  title:       { fontSize: '26px', fontWeight: '800', color: 'var(--c-text)', margin: '0 0 6px', lineHeight: '1.2' },
  subtitle:    { fontSize: '14px', color: 'var(--c-text-2)', margin: 0 },
  form:        { display: 'flex', flexDirection: 'column', gap: '14px', margin: '24px 0' },
  btn:         { padding: '13px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', fontFamily: 'inherit' },
  switchText:  { textAlign: 'center', fontSize: '14px', color: 'var(--c-text-2)', margin: 0 },
  switchLink:  { color: '#2563eb', fontWeight: '700', textDecoration: 'none' },
  errorBox:    { fontSize: '13px', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', margin: 0 },
  successBox:  { fontSize: '13px', color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 12px', margin: 0 },
};

export default RegisterPage;
