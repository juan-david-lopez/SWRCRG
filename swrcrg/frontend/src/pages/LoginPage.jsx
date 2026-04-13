import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import { login } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { saveSession } = useAuth();
  const [form, setForm]       = useState({ correo: '', contrasena: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2>Iniciar sesión</h2>

        <FormInput label="Correo"      type="email"    name="correo"     value={form.correo}     onChange={handleChange} placeholder="tu@correo.com" />
        <FormInput label="Contraseña"  type="password" name="contrasena" value={form.contrasena} onChange={handleChange} placeholder="••••••" />

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <p style={styles.link}>
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </form>
    </div>
  );
};

const styles = {
  wrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' },
  card:    { display: 'flex', flexDirection: 'column', gap: '16px', background: '#fff', padding: '32px', borderRadius: '8px', width: '100%', maxWidth: '360px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  btn:     { padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '15px' },
  link:    { textAlign: 'center', fontSize: '13px', margin: 0 },
  error:   { color: '#dc2626', fontSize: '13px', margin: 0 },
};

export default LoginPage;
