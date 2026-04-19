import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Select personalizado que respeta modo oscuro/claro.
 *
 * Props:
 *   value        — valor seleccionado actualmente
 *   onChange     — fn(value) llamada al seleccionar
 *   options      — [{ value, label }]
 *   placeholder  — texto cuando no hay selección
 *   disabled     — boolean
 *   style        — estilos extra para el trigger
 */
const Select = ({ value, onChange, options = [], placeholder = 'Selecciona...', disabled = false, style = {} }) => {
  const [open, setOpen]   = useState(false);
  const [pos, setPos]     = useState({ top: 0, left: 0, width: 0 });
  const triggerRef        = useRef(null);
  const dropRef           = useRef(null);

  const selected = options.find((o) => o.value === value);

  const handleOpen = () => {
    if (disabled) return;
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX, width: r.width });
    }
    setOpen((o) => !o);
  };

  // Cerrar al click fuera
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        dropRef.current   && !dropRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const dropdown = open && createPortal(
    <div
      ref={dropRef}
      style={{
        position:     'absolute',
        top:          pos.top,
        left:         pos.left,
        minWidth:     pos.width,
        background:   'var(--c-surface)',
        border:       '1px solid var(--c-border)',
        borderRadius: '10px',
        boxShadow:    '0 8px 24px rgba(0,0,0,0.15)',
        zIndex:       9999,
        overflow:     'hidden',
        animation:    'slideUp .12s ease',
        fontFamily:   "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <div
            key={opt.value}
            onClick={() => { onChange(opt.value); setOpen(false); }}
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
              padding:        '9px 14px',
              fontSize:       '13px',
              fontWeight:     isSelected ? '600' : '400',
              color:          isSelected ? '#2563eb' : 'var(--c-text)',
              background:     isSelected ? 'var(--c-primary-bg)' : 'var(--c-surface)',
              cursor:         'pointer',
              gap:            '8px',
              transition:     'background .1s',
            }}
            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--c-bg)'; }}
            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--c-surface)'; }}
          >
            <span>{opt.label}</span>
            {isSelected && <Check size={13} strokeWidth={2.5} color="#2563eb" />}
          </div>
        );
      })}
    </div>,
    document.body
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          gap:            '8px',
          padding:        '9px 12px',
          borderRadius:   '8px',
          border:         '1px solid var(--c-border)',
          background:     'var(--c-surface)',
          color:          selected ? 'var(--c-text)' : 'var(--c-text-3)',
          fontSize:       '13px',
          fontFamily:     'inherit',
          cursor:         disabled ? 'not-allowed' : 'pointer',
          outline:        'none',
          opacity:        disabled ? 0.6 : 1,
          whiteSpace:     'nowrap',
          minWidth:       0,
          ...style,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          color="var(--c-text-3)"
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}
        />
      </button>
      {dropdown}
    </>
  );
};

export default Select;
