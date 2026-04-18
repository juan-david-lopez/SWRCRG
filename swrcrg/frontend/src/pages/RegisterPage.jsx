import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { register } from '../services/auth.service';
import Navbar from '../components/Navbar';

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
  let score = 0;
  if (pwd.length >= 6)          score++;
  if (pwd.length >= 10)         score++;
  if (/[A-Z]/.test(pwd))        score++;
  if (/[0-9]/.test(pwd))        score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

const STRENGTH_LABEL = ['', 'Débil', 'Regular', 'Buena', 'Fuerte', 'Muy fuerte'];
const STRENGTH_COLOR = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];

/* ── Input con icono ── */
const IconInput = ({ icon: Icon, name, type = 'text', value, placeholder, onChange, onBlur, error, hint, right }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <div style={{ ...s.inputWrap, borderColor: error ? '#ef4444' : 'var(--c-border)' }}>
      <Icon size={16} strokeWidth={1.8} color={error ? '#ef4444' : '#9ca3af'} style={{ flexShrink: 0 }} />
      <input
        name={name} type={type} value={value}
        placeholder={placeholder}
        onChange={onChange} onBlur={onBlur}
        style={s.input}
        autoComplete={type === 'password' ? 'new-password' : 'off'}
      />
      {right}
    </div>
    {hint && !error && <span style={s.hint}>{hint}</span>}
    {error && <span style={s.fieldErr}>{error}</span>}
  </div>
);

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm]         = useState(INITIAL);
  const [touched, setTouched]   = useState({});
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [showConf, setShowConf] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };
  const handleBlur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const fieldError = (field) => {
    if (!touched[field]) return '';
    const val = form[field];
    switch (field) {
      case 'nombre':
        if (!val.trim()) return 'Obligatorio';
        if (val.trim().length < 2) return 'Mínimo 2 caracteres';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val)) return 'Solo letras';
        break;
      case 'apellido':
        if (!val.trim()) return 'Obligatorio';
        if (val.trim().length < 2) return 'Mínimo 2 caracteres';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val)) return 'Solo letras';
        break;
      case 'correo':
        if (!val.trim()) return 'Obligatorio';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Correo inválido';
        break;
      case 'contrasena':
        if (!val) return 'Obligatorio';
        if (val.length < 6) return 'Mínimo 6 caracteres';
        if (!/[A-Z]/.test(val)) return 'Falta una mayúscula';
        if (!/[0-9]/.test(val)) return 'Falta un número';
        break;
      case 'confirmar':
        if (val !== form.contrasena) return 'Las contraseñas no coinciden';
        break;
      case 'telefono':
        if (val && !/^[0-9+\-\s()]{7,20}$/.test(val)) return 'Formato inválido';
        break;
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ nombre: true, apellido: true, correo: true, contrasena: true, confirmar: true, telefono: true });
    const err = validate(form);
    if (err) return setError(err);
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { nombre, apellido, correo, contrasena, telefono } = form;
      await register({ nombre, apellido, correo, contrasena, telefono });
      setSuccess('Cuenta creada correctamente. Redirigiendo...');
      setForm(INITIAL);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength(form.contrasena);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", minHeight: '100vh', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={s.page}>
        <form onSubmit={handleSubmit} style={s.card} noValidate>
          <Link to="/" style={s.backLink}>
            <ArrowLeft size={15} strokeWidth={2} />
            Volver al inicio
          </Link>

          <h2 style={s.title}>Crear cuenta</h2>

        <IconInput icon={User}  name="nombre"   value={form.nombre}   placeholder="Nombre"   onChange={handleChange} onBlur={handleBlur} error={fieldError('nombre')} />
        <IconInput icon={User}  name="apellido" value={form.apellido} placeholder="Apellido" onChange={handleChange} onBlur={handleBlur} error={fieldError('apellido')} />
        <IconInput icon={Mail}  name="correo"   value={form.correo}   placeholder="Correo"   onChange={handleChange} onBlur={handleBlur} error={fieldError('correo')} type="email" />

        {/* Contraseña */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ ...s.inputWrap, borderColor: fieldError('contrasena') ? '#ef4444' : 'var(--c-border)' }}>
            <Lock size={16} strokeWidth={1.8} color={fieldError('contrasena') ? '#ef4444' : '#9ca3af'} style={{ flexShrink: 0 }} />
            <input
              name="contrasena" type={showPwd ? 'text' : 'password'}
              value={form.contrasena} placeholder="Contraseña"
              onChange={handleChange} onBlur={handleBlur}
              style={s.input} autoComplete="new-password"
            />
            <button type="button" onClick={() => setShowPwd(!showPwd)} style={s.eyeBtn} tabIndex={-1}>
              {showPwd ? <EyeOff size={16} color="#9ca3af" /> : <Eye size={16} color="#9ca3af" />}
            </button>
          </div>
          <span style={s.hint}>Mínimo 6 caracteres, 1 mayúscula y 1 número</span>
          {form.contrasena && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: STRENGTH_COLOR[strength], textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {STRENGTH_LABEL[strength]}
              </span>
              <div style={s.strengthTrack}>
                <div style={{ ...s.strengthFill, width: `${(strength / 5) * 100}%`, background: STRENGTH_COLOR[strength] }} />
              </div>
            </div>
          )}
          {fieldError('contrasena') && <span style={s.fieldErr}>{fieldError('contrasena')}</span>}
        </div>

        {/* Confirmar contraseña */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ ...s.inputWrap, borderColor: fieldError('confirmar') ? '#ef4444' : 'var(--c-border)' }}>
            <Lock size={16} strokeWidth={1.8} color={fieldError('confirmar') ? '#ef4444' : '#9ca3af'} style={{ flexShrink: 0 }} />
            <input
              name="confirmar" type={showConf ? 'text' : 'password'}
              value={form.confirmar} placeholder="Confirmar contraseña"
              onChange={handleChange} onBlur={handleBlur}
              style={s.input} autoComplete="new-password"
            />
            <button type="button" onClick={() => setShowConf(!showConf)} style={s.eyeBtn} tabIndex={-1}>
              {showConf ? <EyeOff size={16} color="#9ca3af" /> : <Eye size={16} color="#9ca3af" />}
            </button>
          </div>
          {fieldError('confirmar') && <span style={s.fieldErr}>{fieldError('confirmar')}</span>}
        </div>

        <IconInput icon={Phone} name="telefono" value={form.telefono} placeholder="Teléfono" onChange={handleChange} onBlur={handleBlur} error={fieldError('telefono')} hint="Opcional" />

        {error   && <p style={s.errorBox}>{error}</p>}
        {success && <p style={s.successBox}>{success}</p>}

        <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>

        <p style={s.loginLink}>
          ¿Ya tienes cuenta? <Link to="/login" style={s.loginAnchor}>Inicia sesión</Link>
        </p>
      </form>
    </div>
    </div>
  );
};

const s = {
  page:        { display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, padding: '32px 16px' },
  card:        { display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--c-surface)', padding: '36px 32px', borderRadius: '16px', width: '100%', maxWidth: '420px', boxShadow: '0 4px 24px var(--c-shadow)' },
  title:       { margin: '0 0 8px', fontSize: '24px', fontWeight: '700', color: 'var(--c-text)' },
  backLink:    { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--c-text-2)', textDecoration: 'none', fontWeight: '500', marginBottom: '4px' },
  inputWrap:   { display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid var(--c-border)', borderRadius: '8px', padding: '10px 14px', background: 'var(--c-surface)', transition: 'border-color .15s' },
  input:       { flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: 'var(--c-text)', background: 'transparent', fontFamily: 'inherit' },
  eyeBtn:      { background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' },
  hint:        { fontSize: '12px', color: 'var(--c-text-3)', margin: 0 },
  fieldErr:    { fontSize: '12px', color: '#ef4444', margin: 0 },
  strengthTrack: { height: '4px', background: 'var(--c-border)', borderRadius: '2px', overflow: 'hidden' },
  strengthFill:  { height: '100%', borderRadius: '2px', transition: 'width .3s, background .3s' },
  btn:         { padding: '13px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', fontFamily: 'inherit', marginTop: '4px' },
  loginLink:   { textAlign: 'center', fontSize: '13px', margin: 0, color: 'var(--c-text-2)' },
  loginAnchor: { color: '#2563eb', fontWeight: '600', textDecoration: 'none' },
  errorBox:    { fontSize: '13px', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '10px 12px', margin: 0 },
  successBox:  { fontSize: '13px', color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '10px 12px', margin: 0 },
};

export default RegisterPage;
