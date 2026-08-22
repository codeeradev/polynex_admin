import { Link } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import LogoutButton from './LogoutButton';
import ElectionSwitcher from '../elections/ElectionSwitcher';

/**
 * Shell shared by every authenticated route: brand, election switcher,
 * SuperAdmin-only nav links, and the signed-in user's identity.
 */
export default function AppShell({ children }) {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <header
        style={{
          height: 'var(--header-height)',
          background: 'var(--color-primary)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-5)',
          gap: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
          <span style={{ fontWeight: 'var(--font-weight-bold)' }}>PolynexAI Admin</span>
          <ElectionSwitcher />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          {user?.role === 'SuperAdmin' && (
            <>
              <Link to="/elections" style={{ color: '#fff', fontSize: 'var(--font-size-sm)' }}>
                Elections
              </Link>
              <Link to="/admins" style={{ color: '#fff', fontSize: 'var(--font-size-sm)' }}>
                Manage Admins
              </Link>
            </>
          )}
          {user && (
            <span style={{ fontSize: 'var(--font-size-sm)' }}>
              {user.name} · {user.role}
            </span>
          )}
          <LogoutButton />
        </div>
      </header>
      <main style={{ padding: 'var(--space-5)' }}>{children}</main>
    </div>
  );
}
