import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificacionBell from './NotificacionBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <NavLink to="/" style={styles.brand}>SWRCRG</NavLink>
        <NavLink to="/" style={navStyle}>Inicio</NavLink>
        <NavLink to="/reports" style={navStyle}>Reportes</NavLink>
        <NavLink to="/mapa" style={navStyle}>Mapa</NavLink>
        {user && <NavLink to="/reports/create" style={navStyle}>Crear reporte</NavLink>}
        {user && <NavLink to="/mis-reportes" style={navStyle}>Mis reportes</NavLink>}
        {user?.rol === 'administrador' && (
          <NavLink to="/admin/reports" style={navStyle}>Panel admin</NavLink>
        )}
      </div>

      <div style={styles.right}>
        {user ? (
          <>
            <NotificacionBell />
            <NavLink to="/perfil" style={navStyle} title="Mi perfil">
              <span style={styles.username}>{user.nombre} {user.apellido}</span>
            </NavLink>
            <button onClick={handleLogout} style={styles.btn}>
              <LogOut size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login"    style={navStyle}>Iniciar sesión</NavLink>
            <NavLink to="/register" style={() => ({ textDecoration: 'none', color: '#fff', background: '#2563eb', padding: '7px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: '600' })}>Registrarse</NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

const navStyle = ({ isActive }) => ({
  textDecoration: 'none',
  color: isActive ? '#2563eb' : '#333',
  fontWeight: isActive ? 600 : 400,
  fontSize: '14px',
});

const styles = {
  nav:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 32px', background: '#fff', borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap', gap: '12px', width: '100%', boxSizing: 'border-box' },
  left:     { display: 'flex', gap: '20px', alignItems: 'center' },
  right:    { display: 'flex', gap: '16px', alignItems: 'center' },
  username: { fontSize: '14px', color: '#555' },
  btn:      { padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
  brand:    { textDecoration: 'none', color: '#0f172a', fontWeight: '700', fontSize: '16px', marginRight: '8px' },
};

export default Navbar;
