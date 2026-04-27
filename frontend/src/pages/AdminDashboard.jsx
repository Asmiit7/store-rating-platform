import { useState, useEffect } from 'react';
import api from '../utils/api';
import { IconUsers, IconStore, IconBarChart } from '../components/Shared/Icons';
import './DashboardPages.css';

function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/admin');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: <IconUsers size={22} />, color: '#818cf8' },
    { label: 'Total Stores', value: stats.totalStores, icon: <IconStore size={22} />, color: '#a78bfa' },
    { label: 'Total Ratings', value: stats.totalRatings, icon: <IconBarChart size={22} />, color: '#f59e0b' },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Platform overview</p>
        </div>
      </div>
      <div className="stats-grid">
        {statCards.map((card) => (
          <div className="stat-card" key={card.label}>
            <div className="stat-card-icon" style={{ background: `${card.color}12`, color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-card-info">
              <span className="stat-card-value">{loading ? '—' : card.value.toLocaleString()}</span>
              <span className="stat-card-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
