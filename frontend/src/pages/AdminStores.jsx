import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import DataTable from '../components/Shared/DataTable';
import FilterBar from '../components/Shared/FilterBar';
import Modal from '../components/Shared/Modal';
import StarRating from '../components/Shared/StarRating';
import './DashboardPages.css';

function AdminStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [formErrors, setFormErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [storeOwners, setStoreOwners] = useState([]);

  const fetchStores = useCallback(async () => {
    try {
      const params = { ...filters, sortBy, sortOrder };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await api.get('/stores', { params });
      setStores(res.data);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortOrder]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const fetchStoreOwners = async () => {
    try {
      const res = await api.get('/users', { params: { role: 'store_owner' } });
      setStoreOwners(res.data);
    } catch (err) {
      console.error('Failed to fetch store owners:', err);
    }
  };

  const handleOpenCreate = () => {
    fetchStoreOwners();
    setShowModal(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (key, order) => {
    setSortBy(key);
    setSortOrder(order);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setFormErrors([]);

    const errs = [];
    if (form.name.length < 20 || form.name.length > 60) errs.push('Store name must be 20-60 characters.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.push('Invalid email.');
    if (form.address.length > 400) errs.push('Address max 400 characters.');
    if (errs.length > 0) { setFormErrors(errs); return; }

    setSubmitting(true);
    try {
      await api.post('/stores', {
        name: form.name,
        email: form.email,
        address: form.address,
        ownerId: form.ownerId || null,
      });
      setShowModal(false);
      setForm({ name: '', email: '', address: '', ownerId: '' });
      fetchStores();
    } catch (err) {
      const serverErrors = err.response?.data?.errors || [err.response?.data?.error || 'Failed to create store.'];
      setFormErrors(Array.isArray(serverErrors) ? serverErrors : [serverErrors]);
    } finally {
      setSubmitting(false);
    }
  };

  const filterConfig = [
    { key: 'name', type: 'text', placeholder: 'Search by name...' },
    { key: 'address', type: 'text', placeholder: 'Search by address...' },
  ];

  const columns = [
    { key: 'name', label: 'Store Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true, render: (row) => row.address || '—' },
    { key: 'overall_rating', label: 'Rating', sortable: true, render: (row) => (
      <StarRating rating={parseFloat(row.overall_rating)} readonly size="sm" />
    )},
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stores</h1>
          <p className="page-subtitle">Manage registered stores</p>
        </div>
        <button className="btn-primary" onClick={handleOpenCreate} id="add-store-button">
          + Add Store
        </button>
      </div>

      <FilterBar filters={filterConfig} values={filters} onChange={handleFilterChange} />

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : (
        <DataTable
          columns={columns}
          data={stores}
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Store">
        {formErrors.length > 0 && (
          <div className="auth-error">
            {formErrors.map((err, i) => <p key={i}>{err}</p>)}
          </div>
        )}
        <form onSubmit={handleCreateStore} className="modal-form">
          <div className="form-group">
            <label>Store Name</label>
            <input name="name" value={form.name} onChange={handleFormChange} placeholder="Store name (20-60 chars)" required />
            <span className="char-count">{form.name.length}/60</span>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="store@example.com" required />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea name="address" value={form.address} onChange={handleFormChange} placeholder="Store address (max 400 chars)" rows={2} />
          </div>
          <div className="form-group">
            <label>Owner (Optional)</label>
            <select name="ownerId" value={form.ownerId} onChange={handleFormChange}>
              <option value="">No owner assigned</option>
              {storeOwners.map(o => (
                <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
              ))}
            </select>
          </div>
          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? <span className="btn-spinner" /> : 'Create Store'}
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default AdminStores;
