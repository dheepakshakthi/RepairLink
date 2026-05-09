import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Dummy Components for now
const Login = () => <div className="p-8"><h1>Login Page</h1></div>;
const Register = () => <div className="p-8"><h1>Register Page</h1></div>;
const CustomerDashboard = () => <div className="p-8"><h1>Customer Dashboard</h1></div>;
const ProviderDashboard = () => <div className="p-8"><h1>Provider Dashboard</h1></div>;
const AdminDashboard = () => <div className="p-8"><h1>Admin Dashboard</h1></div>;
const Unauthorized = () => <div className="p-8"><h1>Unauthorized</h1></div>;

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Customer Routes */}
      <Route path="/customer/*" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <CustomerDashboard />
        </ProtectedRoute>
      } />

      {/* Provider Routes */}
      <Route path="/provider/*" element={
        <ProtectedRoute allowedRoles={['provider']}>
          <ProviderDashboard />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
