import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconStar } from '../components/Shared/Icons';
import './AuthPages.css';

function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errs = [];
    if (!form.name || form.name.length < 20 || form.name.length > 60) errs.push('Name must be between 20 and 60 characters.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.push('Please provide a valid email address.');
    if (form.password.length < 8 || form.password.length > 16) errs.push('Password must be 8-16 characters.');
    if (!/[A-Z]/.test(form.password)) errs.push('Password must contain at least one uppercase letter.');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password)) errs.push('Password must contain at least one special character.');
    if (form.password !== form.confirmPassword) errs.push('Passwords do not match.');
    if (form.address && form.address.length > 400) errs.push('Address must not exceed 400 characters.');
    return errs;
  };

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (validationErrors.length > 0) { setErrors(validationErrors); return; }
    setErrors([]);
    setLoading(true);
    try {
      await signup({ name: form.name, email: form.email, password: form.password, address: form.address });
      navigate('/stores');
    } catch (err) {
      const serverErrors = err.response?.data?.errors || [err.response?.data?.error || 'Signup failed.'];
      setErrors(Array.isArray(serverErrors) ? serverErrors : [serverErrors]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg"><div className="auth-bg-gradient" /></div>
      <div className="auth-card auth-card--wide">
        <div className="auth-header">
          <div className="auth-logo-mark"><IconStar filled size={18} /></div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join the platform today</p>
        </div>
        {errors.length > 0 && (
          <div className="auth-error">{errors.map((err, i) => <p key={i}>{err}</p>)}</div>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="signup-name">Full Name</label>
            <input id="signup-name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="Enter your full name (20-60 chars)" required minLength={20} maxLength={60} />
            <span className="char-count">{form.name.length}/60</span>
          </div>
          <div className="form-group">
            <label htmlFor="signup-email">Email</label>
            <input id="signup-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label htmlFor="signup-address">Address</label>
            <textarea id="signup-address" name="address" value={form.address} onChange={handleChange} placeholder="Your address (optional, max 400 chars)" maxLength={400} rows={2} />
            <span className="char-count">{form.address.length}/400</span>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <input id="signup-password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="8-16 chars, 1 upper, 1 special" required minLength={8} maxLength={16} />
            </div>
            <div className="form-group">
              <label htmlFor="signup-confirm">Confirm</label>
              <input id="signup-confirm" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" required />
            </div>
          </div>
          <button type="submit" className="auth-submit" id="signup-button" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}

export default SignupPage;
