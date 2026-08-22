import Card from '../ui/Card';

/**
 * `regions` is the array returned by GET /dashboard/region-progress,
 * already sorted by completionPercent descending by the backend.
 */
export default function RegionProgressTable({ regions, loading }) {
  return (
    <Card title="Region Progress">
      {loading && <p>Loading…</p>}

      {!loading && regions.length === 0 && (
        <p className="ui-card-subtitle">No region data yet for this election.</p>
      )}

      {!loading && regions.length > 0 && (
        <table className="ui-table">
          <thead>
            <tr>
              <th>Region</th>
              <th>Total Workers</th>
              <th>Surveys Completed</th>
              <th>Completion</th>
            </tr>
          </thead>
          <tbody>
            {regions.map((r) => (
              <tr key={r.region}>
                <td>{r.region}</td>
                <td>{r.totalWorkers}</td>
                <td>{r.surveysCompleted}</td>
                <td>{r.completionPercent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
