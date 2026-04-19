import { useState, useEffect } from 'react';
import AppRouter from './routes/AppRouter';
import Toast from './components/Toast';
import OnboardingModal from './components/OnboardingModal';
import { useAuth } from './context/AuthContext';

const AppContent = () => {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user && user.onboarding_completado === false) {
      // Pequeño delay para que la app cargue primero
      const t = setTimeout(() => setShowOnboarding(true), 800);
      return () => clearTimeout(t);
    }
  }, [user]);

  return (
    <>
      <AppRouter />
      <Toast />
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
    </>
  );
};

const App = () => <AppContent />;

export default App;
