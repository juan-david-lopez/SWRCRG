import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <main>
      <h1>404</h1>
      <p>Página no encontrada</p>
      <Link to="/">Volver al inicio</Link>
    </main>
  );
};

export default NotFound;
