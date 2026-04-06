import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MainLayout = () => (
  <>
    <Navbar />
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px' }}>
      <Outlet />
    </main>
  </>
);

export default MainLayout;
