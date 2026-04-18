import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

// Singleton event bus
const listeners = new Set();
export const toast = {
  success: (msg) => listeners.forEach((fn) => fn({ type: 'success', msg })),
  error:   (msg) => listeners.forEach((fn) => fn({ type: 'error',   msg })),
};

const Toast = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const handler = ({ type, msg }) => {
      const id = Date.now();
      setItems((prev) => [...prev, { id, type, msg }]);
      setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 3500);
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  if (items.length === 0) return null;

  return (
    <div style={s.container}>
      {items.map((item) => (
        <div key={item.id} style={{ ...s.toast, ...(item.type === 'error' ? s.error : s.success) }}>
          {item.type === 'success'
            ? <CheckCircle size={16} strokeWidth={2} color="#16a34a" />
            : <XCircle    size={16} strokeWidth={2} color="#dc2626" />
          }
          <span style={s.msg}>{item.msg}</span>
          <button onClick={() => setItems((p) => p.filter((i) => i.id !== item.id))} style={s.close}>
            <X size={13} strokeWidth={2.5} />
          </button>
        </div>
      ))}
    </div>
  );
};

const s = {
  container: { position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 9999, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
  toast:     { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', minWidth: '280px', maxWidth: '420px', animation: 'slideUp .2s ease' },
  success:   { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d' },
  error:     { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' },
  msg:       { flex: 1, fontSize: '14px', fontWeight: '500' },
  close:     { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'inherit', opacity: 0.6, padding: 0 },
};

export default Toast;
