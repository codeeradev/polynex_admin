import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import '../styles/auth.css';

export default function SetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setPasswordAction = useAuthStore((s) => s.setPassword);
  const error = useAuthStore((s) => s.error);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!token) {
      setLocalError('This link is missing its token. Ask a Super Admin to resend the invite.');
      return;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const result = await setPasswordAction(token, password);
    setSubmitting(false);
    if (result.success) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-mark">P</span>
          <div>
            <div className="auth-brand-name">
              POLYNEX<span>AI</span>
            </div>
            <div className="auth-brand-tagline">AI-Powered Election Command Center</div>
          </div>
        </div>

        <h1 className="auth-title">Set Your Password</h1>
        <p className="auth-subtitle">Choose a password to activate your admin account</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label" htmlFor="password">
            New password
          </label>
          <input
            id="password"
            type="password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
          />

          <label className="auth-label" htmlFor="confirmPassword">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            className="auth-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            required
          />

          {(localError || error) && <div className="auth-error">{localError || error}</div>}

          <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Set Password & Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
