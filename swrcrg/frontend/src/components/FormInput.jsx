const FormInput = ({ label, type = 'text', name, value, onChange, placeholder }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <label htmlFor={name}>{label}</label>
    <input
      id={name}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
    />
  </div>
);

export default FormInput;
