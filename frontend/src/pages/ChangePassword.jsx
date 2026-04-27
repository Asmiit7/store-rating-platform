import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './DashboardPages.css';

function ChangePassword() {
  const { updatePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPassword.length < 8 || form.newPassword.length > 16) {
      setError('Password must be 8-16 characters.'); return;
    }
    if (!/[A-Z]/.test(form.newPassword)) {
      setError('Password must contain at least one uppercase letter.'); return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.newPassword)) {
      setError('Password must contain at least one special character.'); return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.'); return;
    }

    setLoading(true);
    try {
      await updatePassword(form.currentPassword, form.newPassword);
      setSuccess('Password updated successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0] || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    if (!window.confirm('This will permanently delete all your data. Continue?')) return;

    setDeleting(true);
    try {
      await api.delete('/auth/account');
      logout();
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete account.');
      setDeleting(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="password-card">
          <h2 className="card-title">Change Password</h2>
          {error && <div className="auth-error"><p>{error}</p></div>}
          {success && <div className="auth-success"><p>{success}</p></div>}

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label htmlFor="current-password">Current Password</label>
              <input id="current-password" name="currentPassword" type="password" value={form.currentPassword} onChange={handleChange} placeholder="Enter current password" required />
            </div>
            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input id="new-password" name="newPassword" type="password" value={form.newPassword} onChange={handleChange} placeholder="8-16 chars, 1 upper, 1 special" required minLength={8} maxLength={16} />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <input id="confirm-password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat new password" required />
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Update Password'}
            </button>
          </form>
        </div>

        <div className="danger-card">
          <h2 className="card-title card-title--danger">Danger Zone</h2>
          <p className="danger-text">Permanently delete your account and all associated data. This action cannot be reversed.</p>
          <button
            className="btn-danger"
            onClick={handleDeleteAccount}
            disabled={deleting}
            id="delete-account-button"
          >
            {deleting ? 'Deleting...' : 'Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
