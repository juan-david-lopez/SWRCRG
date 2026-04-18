import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AccessDenied = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={s.page}>
      <span style={s.brand}>SWRCRG</span>

      <div style={s.iconWrap}>
        <Lock size={48} strokeWidth={2} color="#dc2626" fill="#dc2626" />
      </div>

      <h1 style={s.title}>Acceso denegado</h1>
      <p style={s.desc}>No tienes permiso para acceder a esta página.</p>

      <button onClick={() => navigate('/')} style={s.btn}>
        Volver al inicio
      </button>

      <button onClick={handleLogout} style={s.logoutBtn}>
        Cerrar sesión
      </button>
    </div>
  );
};

const s = {
  page:      { minHeight: '100vh', background: '#f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '32px 24px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
  brand:     { fontSize: '18px', fontWeight: '800', color: '#2563eb', letterSpacing: '0.5px', marginBottom: '8px' },
  iconWrap:  { marginBottom: '4px' },
  title:     { fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: 0 },
  desc:      { fontSize: '16px', color: '#64748b', margin: 0, textAlign: 'center' },
  btn:       { marginTop: '8px', padding: '13px 0', width: '100%', maxWidth: '340px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
  logoutBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: '#ef4444', fontFamily: 'inherit' },
};

export default AccessDenied;
