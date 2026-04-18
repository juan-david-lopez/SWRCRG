import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ open, title, message, confirmLabel = 'Confirmar', danger = false, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div style={s.overlay} onClick={onCancel}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.iconWrap}>
          <AlertTriangle size={24} strokeWidth={2} color={danger ? '#dc2626' : '#f59e0b'} />
        </div>
        <h3 style={s.title}>{title}</h3>
        <p style={s.message}>{message}</p>
        <div style={s.actions}>
          <button onClick={onCancel} style={s.cancelBtn}>Cancelar</button>
          <button onClick={onConfirm} style={{ ...s.confirmBtn, background: danger ? '#dc2626' : '#2563eb' }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

const s = {
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
  modal:      { background: 'var(--c-surface)', borderRadius: '16px', padding: '28px 24px', maxWidth: '400px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: '12px' },
  iconWrap:   { width: '48px', height: '48px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title:      { margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--c-text)' },
  message:    { margin: 0, fontSize: '14px', color: 'var(--c-text-2)', lineHeight: '1.6' },
  actions:    { display: 'flex', gap: '10px', marginTop: '8px' },
  cancelBtn:  { flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid var(--c-border)', background: 'var(--c-surface)', fontSize: '14px', fontWeight: '600', color: 'var(--c-text-2)', cursor: 'pointer', fontFamily: 'inherit' },
  confirmBtn: { flex: 1, padding: '11px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '600', color: '#fff', cursor: 'pointer', fontFamily: 'inherit' },
};

export default ConfirmModal;
