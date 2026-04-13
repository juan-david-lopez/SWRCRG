import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout        from '../layouts/MainLayout';
import Home              from '../pages/Home';
import LoginPage         from '../pages/LoginPage';
import RegisterPage      from '../pages/RegisterPage';
import AccessDenied      from '../pages/AccessDenied';
import NotFound          from '../pages/NotFound';
import CreateReportPage  from '../pages/reports/CreateReportPage';
import ReportsListPage   from '../pages/reports/ReportsListPage';
import ReportDetailPage  from '../pages/reports/ReportDetailPage';
import MyReportsPage     from '../pages/reports/MyReportsPage';
import AdminReportsPage  from '../pages/admin/AdminReportsPage';
import ProtectedRoute    from './ProtectedRoute';
import AdminRoute        from './AdminRoute';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* Sin layout: auth */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Con layout */}
      <Route element={<MainLayout />}>
        <Route path="/"        element={<Home />} />
        <Route path="/reports" element={<ReportsListPage />} />
        <Route path="/reports/:id" element={<ReportDetailPage />} />
        <Route path="/acceso-denegado" element={<AccessDenied />} />

        {/* Privadas: cualquier usuario autenticado */}
        <Route element={<ProtectedRoute />}>
          <Route path="/reports/create" element={<CreateReportPage />} />
          <Route path="/mis-reportes"   element={<MyReportsPage />} />
        </Route>

        {/* Privadas: solo admin */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/reports" element={<AdminReportsPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
