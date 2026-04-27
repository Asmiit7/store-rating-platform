import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IconDashboard, IconUsers, IconStore, IconLock, IconLogout, IconStar } from '../Shared/Icons';
import './Layout.css';

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = {
    admin: [
      { to: '/admin/dashboard', icon: <IconDashboard size={18} />, label: 'Dashboard' },
      { to: '/admin/users', icon: <IconUsers size={18} />, label: 'Users' },
      { to: '/admin/stores', icon: <IconStore size={18} />, label: 'Stores' },
      { to: '/admin/password', icon: <IconLock size={18} />, label: 'Password' },
    ],
    user: [
      { to: '/stores', icon: <IconStore size={18} />, label: 'Stores' },
      { to: '/password', icon: <IconLock size={18} />, label: 'Password' },
    ],
    store_owner: [
      { to: '/owner/dashboard', icon: <IconDashboard size={18} />, label: 'Dashboard' },
      { to: '/owner/password', icon: <IconLock size={18} />, label: 'Password' },
    ],
  };

  const items = navItems[user?.role] || [];

  const roleLabels = {
    admin: 'Administrator',
    user: 'User',
    store_owner: 'Store Owner',
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-mark">
              <IconStar filled size={16} />
            </div>
            <span className="logo-text">RateMyStore</span>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{roleLabels[user?.role]}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="logout-btn" onClick={handleLogout} id="logout-button">
          <span className="nav-icon"><IconLogout size={18} /></span>
          <span className="nav-label">Logout</span>
        </button>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
