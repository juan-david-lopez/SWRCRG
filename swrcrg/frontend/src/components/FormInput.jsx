/**
 * FormInput — campo de formulario estándar del proyecto.
 *
 * Props:
 *   icon        — componente de lucide-react (opcional)
 *   label       — texto del label (opcional)
 *   name        — name e id del input
 *   type        — tipo de input (default: 'text')
 *   value       — valor controlado
 *   placeholder — placeholder
 *   onChange    — handler
 *   onBlur      — handler (opcional)
 *   error       — mensaje de error (string)
 *   hint        — texto de ayuda bajo el input (string)
 *   right       — elemento a la derecha del input (ej: botón ojo)
 *   disabled    — boolean
 *   autoComplete
 *   rows        — si se pasa, renderiza <textarea>
 */
const FormInput = ({
  icon: Icon,
  label,
  name,
  type = 'text',
  value,
  placeholder,
  onChange,
  onBlur,
  error,
  hint,
  right,
  disabled = false,
  autoComplete,
  rows,
  style = {},
}) => {
  const hasError = Boolean(error);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', ...style }}>
      {label && (
        <label
          htmlFor={name}
          style={{ fontSize: '13px', fontWeight: '600', color: 'var(--c-text)' }}
        >
          {label}
        </label>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: rows ? 'flex-start' : 'center',
          gap: '10px',
          border: `1px solid ${hasError ? '#ef4444' : 'var(--c-border)'}`,
          borderRadius: '10px',
          padding: '11px 14px',
          background: disabled ? 'var(--c-bg)' : 'var(--c-bg)',
          transition: 'border-color .15s',
          opacity: disabled ? 0.7 : 1,
        }}
      >
        {Icon && (
          <Icon
            size={16}
            strokeWidth={1.8}
            color={hasError ? '#ef4444' : 'var(--c-text-3)'}
            style={{ flexShrink: 0, marginTop: rows ? '2px' : 0 }}
          />
        )}

        {rows ? (
          <textarea
            id={name}
            name={name}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            rows={rows}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              color: 'var(--c-text)',
              background: 'transparent',
              fontFamily: 'inherit',
              resize: 'vertical',
              lineHeight: '1.5',
            }}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            autoComplete={autoComplete ?? (type === 'password' ? 'current-password' : 'off')}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              color: 'var(--c-text)',
              background: 'transparent',
              fontFamily: 'inherit',
            }}
          />
        )}

        {right}
      </div>

      {hint && !hasError && (
        <span style={{ fontSize: '12px', color: 'var(--c-text-3)' }}>{hint}</span>
      )}
      {hasError && (
        <span style={{ fontSize: '12px', color: '#ef4444' }}>{error}</span>
      )}
    </div>
  );
};

export default FormInput;
