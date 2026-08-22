import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import useAuthStore from './store/useAuthStore';

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    hydrate();

    // See axiosClient.js — a 401 anywhere broadcasts this instead of
    // importing the store directly, to avoid a circular import.
    const handleUnauthorized = () => clearSession();
    window.addEventListener('polynexai:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('polynexai:unauthorized', handleUnauthorized);
  }, [hydrate, clearSession]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}