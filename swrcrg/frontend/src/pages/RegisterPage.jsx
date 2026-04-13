import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import { register } from '../services/auth.service';

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

// Fuerza de contraseña: 0-4
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

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm]       = useState(INITIAL);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleBlur = (e) => setTouched({ ...touched, [e.target.name]: true });

  // Errores por campo para mostrar inline
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
        if (val !== form.contrasena) return 'No coincide';
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
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.card} noValidate>
        <h2>Crear cuenta</h2>

        <Field label="Nombre *"     name="nombre"    form={form} fieldError={fieldError} handleChange={handleChange} handleBlur={handleBlur} placeholder="Tu nombre" />
        <Field label="Apellido *"   name="apellido"  form={form} fieldError={fieldError} handleChange={handleChange} handleBlur={handleBlur} placeholder="Tu apellido" />
        <Field label="Correo *"     name="correo"    form={form} fieldError={fieldError} handleChange={handleChange} handleBlur={handleBlur} placeholder="tu@correo.com" type="email" />

        {/* Contraseña con indicador de fuerza */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="contrasena" style={styles.label}>Contraseña *</label>
          <input
            id="contrasena" name="contrasena" type="password"
            value={form.contrasena} onChange={handleChange} onBlur={handleBlur}
            placeholder="Mínimo 6 caracteres, 1 mayúscula y 1 número"
            style={{ ...styles.input, borderColor: fieldError('contrasena') ? '#ef4444' : '#ccc' }}
          />
          {form.contrasena && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1, height: '4px', background: '#e5e7eb', borderRadius: '2px' }}>
                <div style={{ width: `${(strength / 5) * 100}%`, height: '100%', background: STRENGTH_COLOR[strength], borderRadius: '2px', transition: 'width 0.3s' }} />
              </div>
              <span style={{ fontSize: '11px', color: STRENGTH_COLOR[strength] }}>{STRENGTH_LABEL[strength]}</span>
            </div>
          )}
          {fieldError('contrasena') && <span style={styles.fieldErr}>{fieldError('contrasena')}</span>}
        </div>

        {/* Confirmar contraseña */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="confirmar" style={styles.label}>Confirmar contraseña *</label>
          <input
            id="confirmar" name="confirmar" type="password"
            value={form.confirmar} onChange={handleChange} onBlur={handleBlur}
            placeholder="Repite tu contraseña"
            style={{ ...styles.input, borderColor: fieldError('confirmar') ? '#ef4444' : '#ccc' }}
          />
          {fieldError('confirmar') && <span style={styles.fieldErr}>{fieldError('confirmar')}</span>}
        </div>

        <Field label="Teléfono"    name="telefono"  form={form} fieldError={fieldError} handleChange={handleChange} handleBlur={handleBlur} placeholder="Opcional" />

        {error   && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>

        <p style={styles.link}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
};

// Componente auxiliar para campos simples
const Field = ({ label, name, type = 'text', form, fieldError, handleChange, handleBlur, placeholder }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <label htmlFor={name} style={styles.label}>{label}</label>
    <input
      id={name} name={name} type={type}
      value={form[name]} onChange={handleChange} onBlur={handleBlur}
      placeholder={placeholder}
      style={{ ...styles.input, borderColor: fieldError(name) ? '#ef4444' : '#ccc' }}
    />
    {fieldError(name) && <span style={styles.fieldErr}>{fieldError(name)}</span>}
  </div>
);

const styles = {
  wrapper:   { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5', padding: '24px 16px' },
  card:      { display: 'flex', flexDirection: 'column', gap: '14px', background: '#fff', padding: '32px', borderRadius: '8px', width: '100%', maxWidth: '420px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  label:     { fontSize: '13px', fontWeight: 500, color: '#374151' },
  input:     { padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', outline: 'none' },
  fieldErr:  { fontSize: '11px', color: '#ef4444' },
  btn:       { padding: '10px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '15px' },
  link:      { textAlign: 'center', fontSize: '13px', margin: 0 },
  error:     { color: '#dc2626', fontSize: '13px', margin: 0, padding: '8px', background: '#fef2f2', borderRadius: '4px' },
  success:   { color: '#16a34a', fontSize: '13px', margin: 0, padding: '8px', background: '#f0fdf4', borderRadius: '4px' },
};

export default RegisterPage;
