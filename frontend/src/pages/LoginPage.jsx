import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { isAuthenticated, login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    }
    setSubmitting(false);
  };

  return (
    <div className="login-page">
      <div className="glass-card-static login-card">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
          <span style={{ fontSize: '2.5rem' }}>🔐</span>
        </div>
        <h1 className="login-title">Admin Login</h1>
        <p className="login-subtitle">Sign in to manage your portfolio</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@samoba.dev"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div style={{
              padding: 'var(--space-md)', borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--error)', marginBottom: 'var(--space-lg)', fontSize: 'var(--text-sm)'
            }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
