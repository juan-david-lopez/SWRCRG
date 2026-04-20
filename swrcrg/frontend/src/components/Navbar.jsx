import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Moon, Sun, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificacionBell from './NotificacionBell';
import GlobalSearch from './GlobalSearch';

const Navbar = () => {
  const { user, logout }  = useAuth();
  const { dark, toggle }  = useTheme();
  const navigate          = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); setMenuOpen(false); };
  const close = () => setMenuOpen(false);

  const bg     = dark ? 'var(--c-nav-bg)' : '#fff';
  const border = dark ? '1px solid var(--c-border)' : '1px solid #e5e7eb';
  const color  = dark ? 'var(--c-text)'   : '#333';
  const activeColor = dark ? '#60a5fa' : '#2563eb';

  const navStyle = ({ isActive }) => ({
    textDecoration: 'none',
    color: isActive ? activeColor : color,
    fontWeight: isActive ? 600 : 400,
    fontSize: '14px',
  });

  const isCiudadano = user?.rol === 'ciudadano';
  const isAdmin     = user?.rol === 'administrador';

  const links = (
    <>
      <NavLink to="/"        style={navStyle} onClick={close}>Inicio</NavLink>
      <NavLink to="/reports" style={navStyle} onClick={close}>Reportes</NavLink>
      <NavLink to="/mapa"    style={navStyle} onClick={close}>Mapa</NavLink>
      {isCiudadano && <NavLink to="/reports/create" style={navStyle} onClick={close}>Crear reporte</NavLink>}
      {isCiudadano && <NavLink to="/mis-reportes"   style={navStyle} onClick={close}>Mis reportes</NavLink>}
      {isAdmin && (
        <NavLink to="/admin/reports" style={navStyle} onClick={close}>Panel admin</NavLink>
      )}
    </>
  );

  return (
    <nav style={{ background: bg, borderBottom: border, width: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 200 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px' }}>
        {/* Brand */}
        <NavLink to="/" style={{ textDecoration: 'none', color: dark ? '#f1f5f9' : '#0f172a', fontWeight: '700', fontSize: '16px' }}>
          SWRCRG
        </NavLink>

        {/* Desktop links */}
        <div className="hide-mobile" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {links}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <GlobalSearch />
          {/* Dark mode toggle */}
          <button onClick={toggle} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', color: dark ? '#f1f5f9' : '#64748b' }} title={dark ? 'Modo claro' : 'Modo oscuro'}>
            {dark ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
          </button>

          {user ? (
            <>
              <NotificacionBell />
              <NavLink to="/perfil" style={navStyle} title="Mi perfil" className="hide-mobile">
                <span style={{ fontSize: '14px', color: dark ? 'var(--c-text-2)' : '#555' }}>{user.nombre} {user.apellido}</span>
              </NavLink>
              <button onClick={handleLogout} className="hide-mobile" style={{ padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <LogOut size={13} strokeWidth={2} /> Salir
              </button>
            </>
          ) : (
            <div className="hide-mobile" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <NavLink to="/login"    style={navStyle}>Iniciar sesión</NavLink>
              <NavLink to="/register" style={() => ({ textDecoration: 'none', color: '#fff', background: '#2563eb', padding: '7px 14px', borderRadius: '6px', fontSize: '14px', fontWeight: '600' })}>Registrarse</NavLink>
            </div>
          )}

          {/* Hamburger */}
          <button className="hide-desktop" onClick={() => setMenuOpen((o) => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: dark ? '#f1f5f9' : '#0f172a', padding: '4px' }}>
            {menuOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="hide-desktop" style={{ background: bg, borderTop: border, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {links}
          {user ? (
            <>
              <NavLink to="/perfil" style={navStyle} onClick={close}>{user.nombre} {user.apellido} — Perfil</NavLink>
              <button onClick={handleLogout} style={{ padding: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', textAlign: 'left' }}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login"    style={navStyle} onClick={close}>Iniciar sesión</NavLink>
              <NavLink to="/register" onClick={close} style={() => ({ textDecoration: 'none', color: '#fff', background: '#2563eb', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', display: 'block', textAlign: 'center' })}>Registrarse</NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
