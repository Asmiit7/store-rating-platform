import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import DataTable from '../components/Shared/DataTable';
import FilterBar from '../components/Shared/FilterBar';
import Modal from '../components/Shared/Modal';
import './DashboardPages.css';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', role: 'user' });
  const [formErrors, setFormErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const params = { ...filters, sortBy, sortOrder };
      // Remove empty params
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await api.get('/users', { params });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (key, order) => {
    setSortBy(key);
    setSortOrder(order);
  };

  const handleViewUser = async (user) => {
    try {
      const res = await api.get(`/users/${user.id}`);
      setSelectedUser(res.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Failed to fetch user details:', err);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${user.id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user.');
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormErrors([]);

    // Client-side validation
    const errs = [];
    if (form.name.length < 20 || form.name.length > 60) errs.push('Name must be 20-60 characters.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.push('Invalid email.');
    if (form.password.length < 8 || form.password.length > 16) errs.push('Password must be 8-16 characters.');
    if (!/[A-Z]/.test(form.password)) errs.push('Password needs an uppercase letter.');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password)) errs.push('Password needs a special character.');
    if (form.address.length > 400) errs.push('Address max 400 characters.');

    if (errs.length > 0) { setFormErrors(errs); return; }

    setSubmitting(true);
    try {
      await api.post('/users', form);
      setShowModal(false);
      setForm({ name: '', email: '', password: '', address: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      const serverErrors = err.response?.data?.errors || [err.response?.data?.error || 'Failed to create user.'];
      setFormErrors(Array.isArray(serverErrors) ? serverErrors : [serverErrors]);
    } finally {
      setSubmitting(false);
    }
  };

  const filterConfig = [
    { key: 'name', type: 'text', placeholder: 'Search by name...' },
    { key: 'email', type: 'text', placeholder: 'Search by email...' },
    { key: 'address', type: 'text', placeholder: 'Search by address...' },
    { key: 'role', type: 'select', placeholder: 'All Roles', options: [
      { value: 'admin', label: 'Admin' },
      { value: 'user', label: 'Normal User' },
      { value: 'store_owner', label: 'Store Owner' },
    ]},
  ];

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true, render: (row) => row.address || '—' },
    { key: 'role', label: 'Role', sortable: true, render: (row) => (
      <span className={`role-badge role-badge--${row.role}`}>
        {row.role === 'store_owner' ? 'Store Owner' : row.role}
      </span>
    )},
    { key: 'rating', label: 'Rating', sortable: false, render: (row) => (
      row.role === 'store_owner' && row.rating !== null ? `★ ${row.rating}` : '—'
    )},
    { key: 'actions', label: '', sortable: false, render: (row) => (
      <div className="action-btns">
        <button className="btn-sm" onClick={() => handleViewUser(row)}>View</button>
        <button className="btn-sm btn-sm--danger" onClick={() => handleDeleteUser(row)}>Delete</button>
      </div>
    )},
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage platform users</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)} id="add-user-button">
          + Add User
        </button>
      </div>

      <FilterBar filters={filterConfig} values={filters} onChange={handleFilterChange} />

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      )}

      {/* Create User Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New User">
        {formErrors.length > 0 && (
          <div className="auth-error">
            {formErrors.map((err, i) => <p key={i}>{err}</p>)}
          </div>
        )}
        <form onSubmit={handleCreateUser} className="modal-form">
          <div className="form-group">
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleFormChange} placeholder="Full name (20-60 chars)" required />
            <span className="char-count">{form.name.length}/60</span>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="user@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleFormChange} placeholder="8-16 chars, 1 upper, 1 special" required />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea name="address" value={form.address} onChange={handleFormChange} placeholder="Address (max 400 chars)" rows={2} />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select name="role" value={form.role} onChange={handleFormChange}>
              <option value="user">Normal User</option>
              <option value="admin">Admin</option>
              <option value="store_owner">Store Owner</option>
            </select>
          </div>
          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? <span className="btn-spinner" /> : 'Create User'}
          </button>
        </form>
      </Modal>

      {/* User Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="User Details">
        {selectedUser && (
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Name</span>
              <span className="detail-value">{selectedUser.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email</span>
              <span className="detail-value">{selectedUser.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Address</span>
              <span className="detail-value">{selectedUser.address || '—'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Role</span>
              <span className={`role-badge role-badge--${selectedUser.role}`}>
                {selectedUser.role === 'store_owner' ? 'Store Owner' : selectedUser.role}
              </span>
            </div>
            {selectedUser.role === 'store_owner' && selectedUser.rating !== undefined && (
              <div className="detail-item">
                <span className="detail-label">Store Rating</span>
                <span className="detail-value">★ {selectedUser.rating}</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminUsers;
