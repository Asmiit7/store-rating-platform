import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminStores from './pages/AdminStores';
import UserStores from './pages/UserStores';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';
import ChangePassword from './pages/ChangePassword';
import ForgotPassword from './pages/ForgotPassword';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
  return children;
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  // Redirect logged-in users to their home page
  const getHomePath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'user': return '/stores';
      case 'store_owner': return '/owner/dashboard';
      default: return '/login';
    }
  };

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={getHomePath()} /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to={getHomePath()} /> : <SignupPage />} />
      <Route path="/forgot-password" element={user ? <Navigate to={getHomePath()} /> : <ForgotPassword />} />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>
      }>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="stores" element={<AdminStores />} />
        <Route path="password" element={<ChangePassword />} />
      </Route>

      {/* Normal User Routes */}
      <Route path="/" element={
        <ProtectedRoute roles={['user']}><Layout /></ProtectedRoute>
      }>
        <Route path="stores" element={<UserStores />} />
        <Route path="password" element={<ChangePassword />} />
      </Route>

      {/* Store Owner Routes */}
      <Route path="/owner" element={
        <ProtectedRoute roles={['store_owner']}><Layout /></ProtectedRoute>
      }>
        <Route path="dashboard" element={<StoreOwnerDashboard />} />
        <Route path="password" element={<ChangePassword />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to={getHomePath()} />} />
    </Routes>
  );
}

export default App;
