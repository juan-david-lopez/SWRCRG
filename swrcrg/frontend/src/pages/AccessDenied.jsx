import { Link } from 'react-router-dom';

const AccessDenied = () => (
  <div style={styles.wrapper}>
    <h1>403</h1>
    <p>No tienes permiso para acceder a esta página.</p>
    <Link to="/">Volver al inicio</Link>
  </div>
);

const styles = {
  wrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '12px' },
};

export default AccessDenied;
