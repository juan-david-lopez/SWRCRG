import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={s.page}>
      <span style={s.code}>404</span>
      <h1 style={s.title}>Página no encontrada</h1>
      <p style={s.desc}>La página que buscas no existe.</p>
      <button onClick={() => navigate('/')} style={s.btn}>Volver al inicio</button>
    </div>
  );
};

const s = {
  page:  { minHeight: '100vh', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '32px 24px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
  code:  { fontSize: '96px', fontWeight: '800', color: '#2563eb', lineHeight: 1 },
  title: { fontSize: '28px', fontWeight: '700', color: 'var(--c-text)', margin: 0 },
  desc:  { fontSize: '16px', color: 'var(--c-text-3)', margin: 0 },
  btn:   { marginTop: '12px', padding: '13px 48px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
};

export default NotFound;
