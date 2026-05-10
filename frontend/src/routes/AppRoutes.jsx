import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Auth
import { Login, Register } from '../features/auth/AuthPages';

// Customer
import { CustomerDashboard } from '../features/tickets/CustomerDashboard';
import { MyTickets } from '../features/tickets/MyTickets';
import { RaiseTicket } from '../features/tickets/RaiseTicket';
import { TicketDetail } from '../features/tickets/TicketDetail';

// Provider
import { ProviderDashboard } from '../features/provider/ProviderDashboard';
import { Marketplace } from '../features/provider/Marketplace';
import { MyJobs } from '../features/provider/MyJobs';
import { Earnings } from '../features/provider/Earnings';
import { Messages } from '../features/provider/Messages';
import { Reviews } from '../features/provider/Reviews';
import { ProviderProfile } from '../features/provider/ProviderProfile';

// Admin
import { AdminDashboard } from '../features/admin/AdminDashboard';
import { AdminUsers } from '../features/admin/AdminUsers';
import { AdminProviders } from '../features/admin/AdminProviders';
import { AdminTickets } from '../features/admin/AdminTickets';
import { AdminAnalytics } from '../features/admin/AdminAnalytics';
import { AdminSettings } from '../features/admin/AdminSettings';
import { AuditLog } from '../features/admin/AuditLog';

// Shared
import { Notifications } from '../features/shared/Notifications';
import { Profile } from '../features/shared/Profile';

// Loading screen
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center animate-pulse">
        <span className="text-white text-lg">🔧</span>
      </div>
      <p className="text-sm text-surface-400">Loading RepairLink...</p>
    </div>
  </div>
);

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-50">
    <div className="text-center">
      <p className="text-6xl mb-4">🚫</p>
      <h1 className="text-2xl font-bold text-surface-900 mb-2">Access Denied</h1>
      <p className="text-surface-500 mb-6">You don't have permission to view this page.</p>
      <a href="/login" className="btn-primary">Go to Login</a>
    </div>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useSelector(s => s.auth);
  if (loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/unauthorized" replace />;
  return children;
};

const AutoRedirect = () => {
  const { isAuthenticated, user } = useSelector(s => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'provider') return <Navigate to="/provider/dashboard" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/customer/dashboard" replace />;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<AutoRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Shared */}
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute allowedRoles={['customer']}><Profile /></ProtectedRoute>} />

      {/* Customer */}
      <Route path="/customer/dashboard" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/customer/tickets" element={<ProtectedRoute allowedRoles={['customer']}><MyTickets /></ProtectedRoute>} />
      <Route path="/customer/tickets/:id" element={<ProtectedRoute allowedRoles={['customer']}><TicketDetail /></ProtectedRoute>} />
      <Route path="/customer/new" element={<ProtectedRoute allowedRoles={['customer']}><RaiseTicket /></ProtectedRoute>} />

      {/* Provider */}
      <Route path="/provider/dashboard" element={<ProtectedRoute allowedRoles={['provider']}><ProviderDashboard /></ProtectedRoute>} />
      <Route path="/provider/marketplace" element={<ProtectedRoute allowedRoles={['provider']}><Marketplace /></ProtectedRoute>} />
      <Route path="/provider/jobs" element={<ProtectedRoute allowedRoles={['provider']}><MyJobs /></ProtectedRoute>} />
      <Route path="/provider/earnings" element={<ProtectedRoute allowedRoles={['provider']}><Earnings /></ProtectedRoute>} />
      <Route path="/provider/messages" element={<ProtectedRoute allowedRoles={['provider']}><Messages /></ProtectedRoute>} />
      <Route path="/provider/reviews" element={<ProtectedRoute allowedRoles={['provider']}><Reviews /></ProtectedRoute>} />
      <Route path="/provider/profile" element={<ProtectedRoute allowedRoles={['provider']}><ProviderProfile /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/providers" element={<ProtectedRoute allowedRoles={['admin']}><AdminProviders /></ProtectedRoute>} />
      <Route path="/admin/tickets" element={<ProtectedRoute allowedRoles={['admin']}><AdminTickets /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
      <Route path="/admin/audit-log" element={<ProtectedRoute allowedRoles={['admin']}><AuditLog /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
