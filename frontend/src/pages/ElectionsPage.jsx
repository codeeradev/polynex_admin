import { useEffect, useState } from 'react';
import useElectionStore from '../store/useElectionStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import ElectionFormModal from '../components/elections/ElectionFormModal';

/**
 * SuperAdmin-only screen for the election lifecycle: create new
 * campaigns and archive/reactivate ones as they wrap up. Route is
 * gated in AppRoutes.jsx via <ProtectedRoute roles={['SuperAdmin']}>.
 */
export default function ElectionsPage() {
  const {
    elections,
    loading,
    error,
    initialized,
    initializeElections,
    createElection,
    archiveElection,
    activateElection,
  } = useElectionStore();

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!initialized) initializeElections();
  }, [initialized, initializeElections]);

  return (
    <Card title="Elections" actions={<Button onClick={() => setModalOpen(true)}>+ New election</Button>}>
      <p className="ui-card-subtitle">
        Every dashboard, worker list, and survey scopes itself to whichever election is selected
        in the top-nav switcher.
      </p>

      {error && <p className="ui-form-error">{error}</p>}

      {loading && !initialized && <p>Loading elections…</p>}

      {initialized && elections.length === 0 && (
        <EmptyState
          title="No elections yet"
          description="Create the first election to start scoping data to a campaign."
          action={<Button onClick={() => setModalOpen(true)}>Create election</Button>}
        />
      )}

      {elections.length > 0 && (
        <table className="ui-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Dates</th>
              <th>Region scope</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {elections.map((election) => (
              <tr key={election.id}>
                <td>{election.name}</td>
                <td>
                  {election.startDate || '—'} → {election.endDate || '—'}
                </td>
                <td>{election.regionScope?.length ? election.regionScope.join(', ') : 'All regions'}</td>
                <td>
                  <Badge tone={election.status === 'active' ? 'success' : 'neutral'}>
                    {election.status}
                  </Badge>
                </td>
                <td>
                  {election.status === 'active' ? (
                    <Button variant="secondary" size="sm" onClick={() => archiveElection(election.id)}>
                      Archive
                    </Button>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={() => activateElection(election.id)}>
                      Reactivate
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ElectionFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={createElection} />
    </Card>
  );
}
