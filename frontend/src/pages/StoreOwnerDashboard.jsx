import { useState, useEffect } from 'react';
import api from '../utils/api';
import StarRating from '../components/Shared/StarRating';
import DataTable from '../components/Shared/DataTable';
import './DashboardPages.css';

function StoreOwnerDashboard() {
  const [data, setData] = useState({ stores: [] });
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/store-owner');
      setData(res.data);
      if (res.data.stores.length > 0) {
        loadRatings(res.data.stores[0].id);
        setSelectedStore(res.data.stores[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRatings = async (storeId) => {
    setRatingsLoading(true);
    setSelectedStore(storeId);
    try {
      const res = await api.get(`/stores/${storeId}/ratings`);
      setRatings(res.data);
    } catch (err) {
      console.error('Failed to fetch ratings:', err);
    } finally {
      setRatingsLoading(false);
    }
  };

  const ratingColumns = [
    { key: 'user_name', label: 'User', sortable: false },
    { key: 'user_email', label: 'Email', sortable: false },
    { key: 'rating', label: 'Rating', sortable: false, render: (row) => (
      <StarRating rating={row.rating} readonly size="sm" />
    )},
    { key: 'updated_at', label: 'Date', sortable: false, render: (row) => (
      new Date(row.updated_at).toLocaleDateString()
    )},
  ];

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Store Dashboard</h1>
          <p className="page-subtitle">Your store performance</p>
        </div>
      </div>

      {data.stores.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🏪</span>
          <p>No stores assigned to your account yet.</p>
        </div>
      ) : (
        <>
          <div className="store-owner-cards">
            {data.stores.map(store => (
              <div
                key={store.id}
                className={`owner-store-card ${selectedStore === store.id ? 'owner-store-card--active' : ''}`}
                onClick={() => loadRatings(store.id)}
              >
                <h3>{store.name}</h3>
                <div className="owner-store-stats">
                  <div className="owner-stat">
                    <span className="owner-stat-value">⭐ {parseFloat(store.avg_rating).toFixed(1)}</span>
                    <span className="owner-stat-label">Avg Rating</span>
                  </div>
                  <div className="owner-stat">
                    <span className="owner-stat-value">{store.total_ratings}</span>
                    <span className="owner-stat-label">Total Ratings</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="ratings-section">
            <h2 className="section-title">User Ratings</h2>
            {ratingsLoading ? (
              <div className="loading-container"><div className="spinner" /></div>
            ) : (
              <DataTable columns={ratingColumns} data={ratings} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default StoreOwnerDashboard;
