import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout        from '../layouts/MainLayout';
import Home              from '../pages/Home';
import LoginPage         from '../pages/LoginPage';
import RegisterPage      from '../pages/RegisterPage';
import AccessDenied      from '../pages/AccessDenied';
import NotFound          from '../pages/NotFound';
import ProfilePage       from '../pages/ProfilePage';
import MapPage           from '../pages/MapPage';
import CreateReportPage  from '../pages/reports/CreateReportPage';
import ReportsListPage   from '../pages/reports/ReportsListPage';
import ReportDetailPage  from '../pages/reports/ReportDetailPage';
import MyReportsPage     from '../pages/reports/MyReportsPage';
import AdminReportsPage  from '../pages/admin/AdminReportsPage';
import PrivacidadPage    from '../pages/legal/PrivacidadPage';
import TerminosPage      from '../pages/legal/TerminosPage';
import CookiesPage       from '../pages/legal/CookiesPage';
import ProtectedRoute    from './ProtectedRoute';
import AdminRoute        from './AdminRoute';
import CiudadanoRoute    from './CiudadanoRoute';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<MainLayout />}>
        <Route path="/"            element={<Home />} />
        <Route path="/reports"     element={<ReportsListPage />} />
        <Route path="/reports/:id" element={<ReportDetailPage />} />
        <Route path="/mapa"        element={<MapPage />} />
        <Route path="/privacidad"  element={<PrivacidadPage />} />
        <Route path="/terminos"    element={<TerminosPage />} />
        <Route path="/cookies"     element={<CookiesPage />} />
        <Route path="/acceso-denegado" element={<AccessDenied />} />

        {/* Solo ciudadanos */}
        <Route element={<CiudadanoRoute />}>
          <Route path="/reports/create" element={<CreateReportPage />} />
          <Route path="/mis-reportes"   element={<MyReportsPage />} />
        </Route>

        {/* Cualquier usuario autenticado */}
        <Route element={<ProtectedRoute />}>
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>

        {/* Solo administradores */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/reports" element={<AdminReportsPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
