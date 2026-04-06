import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import { register } from '../services/auth.service';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await register(form);
      setSuccess('Cuenta creada correctamente. Redirigiendo...');
      setForm({ name: '', email: '', password: '' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2>Crear cuenta</h2>

        <FormInput label="Nombre"     name="name"     value={form.name}     onChange={handleChange} placeholder="Tu nombre" />
        <FormInput label="Email"      type="email"    name="email"    value={form.email}    onChange={handleChange} placeholder="tu@email.com" />
        <FormInput label="Contraseña" type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••" />

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

const styles = {
  wrapper:  { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' },
  card:     { display: 'flex', flexDirection: 'column', gap: '16px', background: '#fff', padding: '32px', borderRadius: '8px', width: '100%', maxWidth: '360px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  btn:      { padding: '10px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '15px' },
  link:     { textAlign: 'center', fontSize: '13px', margin: 0 },
  error:    { color: '#dc2626', fontSize: '13px', margin: 0 },
  success:  { color: '#16a34a', fontSize: '13px', margin: 0 },
};

export default RegisterPage;
