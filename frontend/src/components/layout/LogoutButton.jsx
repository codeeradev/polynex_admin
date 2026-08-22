import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

export default function LogoutButton() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      className="btn"
      style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.4)' }}
    >
      Logout
    </button>
  );
}
