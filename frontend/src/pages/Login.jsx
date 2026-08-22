import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import '../styles/auth.css';

const ROLES = [
  { value: 'SuperAdmin', label: 'Super Admin' },
  { value: 'RegionalAdmin', label: 'Regional Admin' },
];

export default function Login() {
  const [step, setStep] = useState('identify'); // 'identify' | 'password'
  const [role, setRole] = useState('SuperAdmin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const login = useAuthStore((s) => s.login);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from?.pathname || '/';

  const handleContinue = (e) => {
    e.preventDefault();
    if (!email) return;
    clearError?.();
    setStep('password');
  };

  const handleBack = () => {
    clearError?.();
    setPassword('');
    setStep('identify');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await login(email, password, role);
    setSubmitting(false);
    if (result.success) {
      navigate(redirectTo, { replace: true });
    }
  };

  const roleLabel = ROLES.find((r) => r.value === role)?.label || role;
  const avatarLetter = (email.trim()[0] || '?').toUpperCase();

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

        {step === 'identify' && (
          <div className="auth-step-enter">
            <h1 className="auth-title">Sign in</h1>
            <p className="auth-subtitle">Use your admin account to continue</p>

            <form onSubmit={handleContinue} className="auth-form">
              <div className="auth-segment" role="group" aria-label="Sign in as">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    className="auth-segment-btn"
                    aria-pressed={role === r.value}
                    onClick={() => setRole(r.value)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <p className="auth-segment-hint">
                We'll check that this account actually holds the {roleLabel} role.
              </p>

              <label className="auth-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@polynexai.com"
                autoComplete="email"
                autoFocus
                required
              />

              {error && (
                <div className="auth-error">
                  <span>⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="auth-actions">
                <span />
                <button type="submit" className="btn btn-primary auth-submit">
                  Next
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'password' && (
          <div className="auth-step-enter">
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Enter your password to continue</p>

            <button type="button" className="auth-chip" onClick={handleBack}>
              <span className="auth-chip-avatar">{avatarLetter}</span>
              <span className="auth-chip-label">{email}</span>
              <span className="auth-chip-caret">▾</span>
            </button>

            <form onSubmit={handleSubmit} className="auth-form">
              <label className="auth-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                autoFocus
                required
              />

              {error && (
                <div className="auth-error">
                  <span>⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="auth-actions">
                <button type="button" className="auth-link-btn" onClick={handleBack}>
                  Back
                </button>
                <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
                  {submitting ? 'Signing in…' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="auth-footer">
          <span>🔒</span> Your session signs out automatically when it expires.
        </div>
      </div>
    </div>
  );
}
