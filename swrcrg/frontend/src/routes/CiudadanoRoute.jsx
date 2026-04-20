import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CiudadanoRoute = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.rol === 'administrador') return <Navigate to="/admin/reports" replace />;
  return <Outlet />;
};

export default CiudadanoRoute;
