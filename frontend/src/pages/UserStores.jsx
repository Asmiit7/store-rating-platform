import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import StarRating from '../components/Shared/StarRating';
import FilterBar from '../components/Shared/FilterBar';
import './DashboardPages.css';

function UserStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [ratingLoading, setRatingLoading] = useState(null);

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

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRate = async (storeId, rating) => {
    setRatingLoading(storeId);
    try {
      await api.post(`/stores/${storeId}/rate`, { rating });
      fetchStores();
    } catch (err) {
      console.error('Failed to rate store:', err);
    } finally {
      setRatingLoading(null);
    }
  };

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const filterConfig = [
    { key: 'name', type: 'text', placeholder: 'Search by store name...' },
    { key: 'address', type: 'text', placeholder: 'Search by address...' },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stores</h1>
          <p className="page-subtitle">Browse and rate stores</p>
        </div>
      </div>
      <FilterBar filters={filterConfig} values={filters} onChange={handleFilterChange} />
      <div className="sort-bar">
        <span className="sort-label">Sort by:</span>
        {[{ key: 'name', label: 'Name' }, { key: 'address', label: 'Address' }, { key: 'overall_rating', label: 'Rating' }].map(item => (
          <button key={item.key} className={`sort-chip ${sortBy === item.key ? 'sort-chip--active' : ''}`} onClick={() => handleSort(item.key)}>
            {item.label} {sortBy === item.key && <span className="sort-dir">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : stores.length === 0 ? (
        <div className="empty-state"><span className="empty-icon">🏪</span><p>No stores found</p></div>
      ) : (
        <div className="store-grid">
          {stores.map(store => (
            <div className="store-card" key={store.id}>
              <div className="store-card-header">
                <h3 className="store-card-name">{store.name}</h3>
                <div className="store-card-rating-badge">⭐ {parseFloat(store.overall_rating).toFixed(1)}</div>
              </div>
              <p className="store-card-address">{store.address || 'No address provided'}</p>
              <div className="store-card-divider" />
              <div className="store-card-rating-section">
                <div className="store-card-overall">
                  <span className="rating-label">Overall Rating</span>
                  <StarRating rating={parseFloat(store.overall_rating)} readonly size="sm" />
                  <span className="rating-count">({store.total_ratings} ratings)</span>
                </div>
                <div className="store-card-your-rating">
                  <span className="rating-label">{store.user_rating ? 'Your Rating' : 'Rate this store'}</span>
                  <StarRating rating={store.user_rating || 0} onRate={(r) => handleRate(store.id, r)} size="md" />
                  {ratingLoading === store.id && <span className="rating-saving">Saving...</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserStores;
