import { useEffect, useRef, useState } from 'react';
import { getNotificaciones, marcarLeida, marcarTodasLeidas } from '../services/notificacion.service';

const NotificacionBell = () => {
  const [notifs, setNotifs]   = useState([]);
  const [open, setOpen]       = useState(false);
  const ref                   = useRef(null);

  const noLeidas = notifs.filter((n) => !n.leida).length;

  useEffect(() => {
    getNotificaciones()
      .then(({ notificaciones }) => setNotifs(notificaciones))
      .catch(() => {});
  }, []);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarcarLeida = async (id) => {
    await marcarLeida(id);
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, leida: true } : n));
  };

  const handleMarcarTodas = async () => {
    await marcarTodasLeidas();
    setNotifs((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  return (
    <div ref={ref} style={styles.wrapper}>
      <button onClick={() => setOpen((o) => !o)} style={styles.bell} aria-label="Notificaciones">
        🔔
        {noLeidas > 0 && <span style={styles.badge}>{noLeidas}</span>}
      </button>

      {open && (
        <div style={styles.dropdown}>
          <div style={styles.dropHeader}>
            <span style={styles.dropTitle}>Notificaciones</span>
            {noLeidas > 0 && (
              <button onClick={handleMarcarTodas} style={styles.markAll}>Marcar todas leídas</button>
            )}
          </div>

          {notifs.length === 0 ? (
            <p style={styles.empty}>Sin notificaciones</p>
          ) : (
            <ul style={styles.list}>
              {notifs.map((n) => (
                <li
                  key={n.id}
                  style={{ ...styles.item, background: n.leida ? '#fff' : '#eff6ff' }}
                  onClick={() => !n.leida && handleMarcarLeida(n.id)}
                >
                  <p style={styles.itemTitle}>{n.titulo}</p>
                  <p style={styles.itemMsg}>{n.mensaje}</p>
                  {!n.leida && <span style={styles.dot} />}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper:    { position: 'relative' },
  bell:       { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', position: 'relative', padding: '4px' },
  badge:      { position: 'absolute', top: 0, right: 0, background: '#ef4444', color: '#fff', borderRadius: '50%', fontSize: '10px', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 },
  dropdown:   { position: 'absolute', right: 0, top: '36px', width: '300px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 100, overflow: 'hidden' },
  dropHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #f0f0f0' },
  dropTitle:  { fontWeight: 600, fontSize: '14px' },
  markAll:    { background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', cursor: 'pointer' },
  list:       { listStyle: 'none', margin: 0, padding: 0, maxHeight: '320px', overflowY: 'auto' },
  item:       { padding: '12px 16px', borderBottom: '1px solid #f5f5f5', cursor: 'pointer', position: 'relative' },
  itemTitle:  { margin: '0 0 2px', fontSize: '13px', fontWeight: 600, color: '#333' },
  itemMsg:    { margin: 0, fontSize: '12px', color: '#666' },
  dot:        { position: 'absolute', top: '14px', right: '12px', width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' },
  empty:      { padding: '20px', textAlign: 'center', color: '#aaa', fontSize: '13px' },
};

export default NotificacionBell;
