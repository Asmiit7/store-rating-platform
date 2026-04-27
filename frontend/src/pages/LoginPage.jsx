import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconStar, IconMail, IconLock } from '../components/Shared/Icons';
import './AuthPages.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      switch (user.role) {
        case 'admin': navigate('/admin/dashboard'); break;
        case 'user': navigate('/stores'); break;
        case 'store_owner': navigate('/owner/dashboard'); break;
        default: navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-gradient" />
      </div>
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-mark"><IconStar filled size={18} /></div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoFocus />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="auth-submit" id="login-button" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Sign In'}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
        </div>
        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
