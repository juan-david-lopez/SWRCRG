import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home         from '../pages/Home';
import LoginPage    from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import NotFound     from '../pages/NotFound';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/"         element={<Home />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*"         element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
