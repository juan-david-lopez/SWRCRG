import { useEffect, useRef, useState } from 'react';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { getNotificaciones, marcarLeida, marcarTodasLeidas } from '../services/notificacion.service';
import { createPortal } from 'react-dom';

const NotificacionBell = () => {
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen]     = useState(false);
  const btnRef              = useRef(null);
  const dropRef             = useRef(null);
  const [pos, setPos]       = useState({ top: 0, right: 0 });

  const noLeidas = notifs.filter((n) => !n.leida).length;

  useEffect(() => {
    const fetch = () =>
      getNotificaciones()
        .then(({ notificaciones }) => setNotifs(notificaciones))
        .catch(() => {});
    fetch();
    const id = setInterval(fetch, 30000);
    return () => clearInterval(id);
  }, []);

  // Calcular posición del dropdown relativa al botón
  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({
        top:   rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen((o) => !o);
  };

  // Cerrar al click fuera
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        dropRef.current && !dropRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleMarcarLeida = async (id) => {
    await marcarLeida(id);
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, leida: true } : n));
  };

  const handleMarcarTodas = async () => {
    await marcarTodasLeidas();
    setNotifs((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  const dropdown = open && createPortal(
    <div
      ref={dropRef}
      style={{
        position:   'absolute',
        top:        pos.top,
        right:      pos.right,
        width:      '320px',
        background: 'var(--c-surface)',
        border:     '1px solid var(--c-border)',
        borderRadius: '14px',
        boxShadow:  '0 8px 32px rgba(0,0,0,0.18)',
        zIndex:     9999,
        overflow:   'hidden',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        animation:  'slideUp .15s ease',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 16px', borderBottom: '1px solid var(--c-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--c-text)' }}>
            Notificaciones
          </span>
          {noLeidas > 0 && (
            <span style={{
              fontSize: '11px', fontWeight: '700', background: '#ef4444',
              color: '#fff', borderRadius: '20px', padding: '1px 7px',
            }}>
              {noLeidas}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {noLeidas > 0 && (
            <button
              onClick={handleMarcarTodas}
              title="Marcar todas como leídas"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '12px', fontWeight: '600', color: '#2563eb',
                padding: '4px 8px', borderRadius: '6px', fontFamily: 'inherit',
              }}
            >
              <CheckCheck size={14} strokeWidth={2} />
              Todas leídas
            </button>
          )}
          <button
            onClick={() => setOpen(false)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', padding: '4px',
              color: 'var(--c-text-3)', borderRadius: '6px',
            }}
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Lista */}
      <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
        {notifs.length === 0 ? (
          <div style={{
            padding: '32px 16px', textAlign: 'center',
            color: 'var(--c-text-3)', fontSize: '13px',
          }}>
            <Bell size={28} strokeWidth={1.2} color="var(--c-text-3)" style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p style={{ margin: 0 }}>Sin notificaciones</p>
          </div>
        ) : (
          notifs.map((n, i) => (
            <div
              key={n.id}
              onClick={() => !n.leida && handleMarcarLeida(n.id)}
              style={{
                padding: '12px 16px',
                borderBottom: i < notifs.length - 1 ? '1px solid var(--c-border)' : 'none',
                cursor: n.leida ? 'default' : 'pointer',
                background: n.leida ? 'var(--c-surface)' : 'var(--c-primary-bg)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                transition: 'background .15s',
              }}
            >
              {/* Indicador leída/no leída */}
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, marginTop: '5px',
                background: n.leida ? 'var(--c-border)' : '#2563eb',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: '0 0 3px', fontSize: '13px', fontWeight: n.leida ? '500' : '700',
                  color: 'var(--c-text)', lineHeight: '1.3',
                }}>
                  {n.titulo}
                </p>
                <p style={{
                  margin: 0, fontSize: '12px', color: 'var(--c-text-2)',
                  lineHeight: '1.5',
                }}>
                  {n.mensaje}
                </p>
              </div>
              {!n.leida && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleMarcarLeida(n.id); }}
                  title="Marcar como leída"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', padding: '2px',
                    color: '#2563eb', flexShrink: 0,
                  }}
                >
                  <Check size={13} strokeWidth={2.5} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>,
    document.body
  );

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        ref={btnRef}
        onClick={handleToggle}
        aria-label="Notificaciones"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          position: 'relative', padding: '6px',
          display: 'flex', alignItems: 'center',
          color: 'var(--c-text-2)', borderRadius: '8px',
        }}
      >
        <Bell size={18} strokeWidth={1.8} />
        {noLeidas > 0 && (
          <span style={{
            position: 'absolute', top: '1px', right: '1px',
            background: '#ef4444', color: '#fff', borderRadius: '50%',
            fontSize: '9px', fontWeight: '700',
            width: '15px', height: '15px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          }}>
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>
      {dropdown}
    </div>
  );
};

export default NotificacionBell;
