import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconStar } from '../components/Shared/Icons';
import api from '../utils/api';
import './AuthPages.css';

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: email, 2: verify + reset
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email, address, newPassword });
      setSuccess(res.data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg"><div className="auth-bg-gradient" /></div>
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-mark"><IconStar filled size={18} /></div>
          <h1 className="auth-title">Reset password</h1>
          <p className="auth-subtitle">Verify your identity to reset</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success"><p>{success}</p></div>}

        {step < 3 ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="forgot-email">Email</label>
              <input id="forgot-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your registered email" required />
            </div>
            <div className="form-group">
              <label htmlFor="forgot-address">Registered Address</label>
              <input id="forgot-address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter your registered address" required />
              <span className="form-hint">Must match the address on your account</span>
            </div>
            <div className="form-group">
              <label htmlFor="forgot-new-password">New Password</label>
              <input id="forgot-new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="8-16 chars, 1 upper, 1 special" required minLength={8} maxLength={16} />
            </div>
            <div className="form-group">
              <label htmlFor="forgot-confirm">Confirm Password</label>
              <input id="forgot-confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" required />
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Reset Password'}
            </button>
          </form>
        ) : (
          <div className="reset-success">
            <p>Your password has been reset. You can now sign in.</p>
            <Link to="/login" className="auth-submit" style={{ textAlign: 'center', textDecoration: 'none' }}>
              Go to Sign In
            </Link>
          </div>
        )}

        <p className="auth-footer">
          Remember your password? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
