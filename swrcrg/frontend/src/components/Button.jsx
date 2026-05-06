/**
 * Button — botón estándar del proyecto.
 *
 * Props:
 *   variant   — 'primary' | 'secondary' | 'danger' | 'ghost'  (default: 'primary')
 *   size      — 'sm' | 'md' | 'lg'  (default: 'md')
 *   loading   — boolean, muestra spinner y deshabilita
 *   disabled  — boolean
 *   type      — 'button' | 'submit' | 'reset'  (default: 'button')
 *   onClick   — handler
 *   children  — contenido
 *   style     — estilos extra
 *   fullWidth — boolean
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  children,
  style = {},
  fullWidth = false,
}) => {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    borderRadius: '10px',
    fontFamily: 'inherit',
    fontWeight: '700',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.65 : 1,
    transition: 'opacity .15s, background .15s',
    width: fullWidth ? '100%' : undefined,
  };

  const sizes = {
    sm: { padding: '7px 14px',  fontSize: '13px' },
    md: { padding: '11px 20px', fontSize: '14px' },
    lg: { padding: '13px 24px', fontSize: '15px' },
  };

  const variants = {
    primary:   { background: '#2563eb', color: '#fff', border: 'none' },
    secondary: { background: 'var(--c-surface)', color: 'var(--c-text)', border: '1px solid var(--c-border)' },
    danger:    { background: '#dc2626', color: '#fff', border: 'none' },
    ghost:     { background: 'transparent', color: 'var(--c-text-2)', border: '1px solid var(--c-border)' },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
    >
      {loading && (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin .6s linear infinite',
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </button>
  );
};

export default Button;
