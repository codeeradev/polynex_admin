import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useElectionStore from '../../store/useElectionStore';
import useAuthStore from '../../store/useAuthStore';
import Menu from '../ui/Menu';
import Badge from '../ui/Badge';
import '../../styles/elections.css';

/**
 * Top-nav control for choosing which election every scoped API call
 * (workers, leadership, surveys, responses, booths) targets. Reads and
 * writes useElectionStore; see that file for why the selection is kept
 * in memory only, not localStorage.
 */
export default function ElectionSwitcher() {
  const { elections, activeElection, loading, initialized, setActiveElection, initializeElections } =
    useElectionStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!initialized) initializeElections();
  }, [initialized, initializeElections]);

  if (loading && !initialized) {
    return <div className="election-switcher-skeleton" aria-hidden="true" />;
  }

  if (initialized && elections.length === 0) {
    return user?.role === 'SuperAdmin' ? (
      <Link to="/elections" className="election-switcher-empty-link">
        + Create an election
      </Link>
    ) : (
      <span className="election-switcher-empty">No elections yet</span>
    );
  }

  return (
    <Menu
      width={300}
      trigger={({ toggle, open }) => (
        <button
          type="button"
          className="election-switcher-trigger"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <span className="election-switcher-name">{activeElection?.name || 'Select election'}</span>
          {activeElection && (
            <Badge tone={activeElection.status === 'active' ? 'success' : 'neutral'}>
              {activeElection.status}
            </Badge>
          )}
          <span className="election-switcher-caret" aria-hidden="true">▾</span>
        </button>
      )}
    >
      {({ close }) => (
        <div className="election-switcher-panel">
          <ul className="election-switcher-list" role="none">
            {elections.map((election) => (
              <li key={election.id} role="none">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={election.id === activeElection?.id}
                  className="election-switcher-item"
                  onClick={() => {
                    setActiveElection(election);
                    close();
                  }}
                >
                  <span className="election-switcher-item-check" aria-hidden="true">
                    {election.id === activeElection?.id ? '✓' : ''}
                  </span>
                  <span className="election-switcher-item-name">{election.name}</span>
                  <Badge tone={election.status === 'active' ? 'success' : 'neutral'}>
                    {election.status}
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
          {user?.role === 'SuperAdmin' && (
            <Link to="/elections" className="election-switcher-manage" onClick={close}>
              Manage elections
            </Link>
          )}
        </div>
      )}
    </Menu>
  );
}
