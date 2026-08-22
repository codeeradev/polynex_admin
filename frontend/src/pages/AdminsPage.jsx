import { useEffect, useState } from 'react';
import useAdminStore from '../store/useAdminStore';

const ROLES = ['SuperAdmin', 'RegionalAdmin'];

/**
 * SuperAdmin-only screen. Route to this is gated in AppRoutes.jsx via
 * <ProtectedRoute roles={['SuperAdmin']}>.
 */
export default function AdminsPage() {
  const { admins, loading, error, fetchAdmins, inviteAdmin, disableAdmin, enableAdmin } =
    useAdminStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'RegionalAdmin',
    assignedRegion: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setFormError('');

    if (form.role === 'RegionalAdmin' && !form.assignedRegion.trim()) {
      setFormError('Assigned region is required for RegionalAdmin accounts.');
      return;
    }

    setSubmitting(true);
    const payload = {
      name: form.name,
      email: form.email,
      role: form.role,
      assignedRegion: form.role === 'RegionalAdmin' ? form.assignedRegion : null,
    };
    const result = await inviteAdmin(payload);
    setSubmitting(false);

    if (result.success) {
      setForm({ name: '', email: '', role: 'RegionalAdmin', assignedRegion: '' });
    } else {
      setFormError(result.message);
    }
  };

  return (
    <div className="card">
      <h1 style={{ marginTop: 0 }}>Manage Admins</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>
        Invite new admin accounts and manage roles, region scope, and access.
      </p>

      <form
        onSubmit={handleInvite}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          alignItems: 'flex-end',
          margin: 'var(--space-5) 0',
        }}
      >
        <div>
          <label className="auth-label" htmlFor="name">Name</label>
          <input
            id="name"
            className="auth-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="auth-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="auth-input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="auth-label" htmlFor="role">Role</label>
          <select
            id="role"
            className="auth-input"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {form.role === 'RegionalAdmin' && (
          <div>
            <label className="auth-label" htmlFor="assignedRegion">Assigned Region</label>
            <input
              id="assignedRegion"
              className="auth-input"
              value={form.assignedRegion}
              onChange={(e) => setForm({ ...form, assignedRegion: e.target.value })}
              required
            />
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Inviting…' : 'Invite Admin'}
        </button>
      </form>

      {(formError || error) && <div className="auth-error">{formError || error}</div>}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: 'var(--space-2)' }}>Name</th>
              <th style={{ padding: 'var(--space-2)' }}>Email</th>
              <th style={{ padding: 'var(--space-2)' }}>Role</th>
              <th style={{ padding: 'var(--space-2)' }}>Region</th>
              <th style={{ padding: 'var(--space-2)' }}>Status</th>
              <th style={{ padding: 'var(--space-2)' }}></th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: 'var(--space-2)' }}>{a.name}</td>
                <td style={{ padding: 'var(--space-2)' }}>{a.email}</td>
                <td style={{ padding: 'var(--space-2)' }}>{a.role}</td>
                <td style={{ padding: 'var(--space-2)' }}>{a.assignedRegion || '—'}</td>
                <td style={{ padding: 'var(--space-2)' }}>{a.status}</td>
                <td style={{ padding: 'var(--space-2)' }}>
                  {a.status === 'disabled' ? (
                    <button className="btn" onClick={() => enableAdmin(a.id)}>Enable</button>
                  ) : (
                    <button className="btn" onClick={() => disableAdmin(a.id)}>Disable</button>
                  )}
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 'var(--space-3)', color: 'var(--color-text-muted)' }}>
                  No admins yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
