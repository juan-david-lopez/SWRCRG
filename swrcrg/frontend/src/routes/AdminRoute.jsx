import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.rol !== 'administrador') return <Navigate to="/acceso-denegado" replace />;
  return <Outlet />;
};

export default AdminRoute;
