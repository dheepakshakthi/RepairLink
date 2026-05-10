import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, Ticket, Search, Bell, ChevronDown, LogOut,
  Wrench, ShoppingBag, Briefcase, DollarSign, MessageSquare, Star,
  Users, ShieldCheck, BarChart3, Settings, FileText, Menu, X,
  Smartphone, Plus, User, Home, MapPin, ChevronRight
} from 'lucide-react';
import { logout } from '../features/auth/authSlice';
import { Avatar, NotifDot } from '../components/ui';

const customerNav = [
  { to: '/customer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customer/tickets',   icon: Ticket,          label: 'My Tickets' },
  { to: '/customer/new',       icon: Plus,            label: 'Raise Ticket' },
  { to: '/providers',          icon: Search,          label: 'Browse Providers' },
  { to: '/notifications',      icon: Bell,            label: 'Notifications' },
  { to: '/profile',            icon: User,            label: 'Profile' },
];

const providerNav = [
  { to: '/provider/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/provider/marketplace', icon: ShoppingBag,     label: 'Marketplace' },
  { to: '/provider/jobs',        icon: Briefcase,       label: 'My Jobs' },
  { to: '/provider/earnings',    icon: DollarSign,      label: 'Earnings' },
  { to: '/provider/messages',    icon: MessageSquare,   label: 'Messages' },
  { to: '/provider/reviews',     icon: Star,            label: 'Reviews' },
  { to: '/provider/profile',     icon: Wrench,          label: 'Shop Profile' },
  { to: '/notifications',        icon: Bell,            label: 'Notifications' },
];

const adminNav = [
  { to: '/admin/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users',      icon: Users,           label: 'Users' },
  { to: '/admin/providers',  icon: ShieldCheck,     label: 'Providers' },
  { to: '/admin/tickets',    icon: Ticket,          label: 'All Tickets' },
  { to: '/admin/analytics',  icon: BarChart3,       label: 'Analytics' },
  { to: '/admin/settings',   icon: Settings,        label: 'Settings' },
  { to: '/admin/audit-log',  icon: FileText,        label: 'Audit Log' },
];

function NavItem({ item, collapsed }) {
  const location = useLocation();
  const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
  return (
    <Link to={item.to} className={`sidebar-link ${active ? 'active' : ''}`}>
      <item.icon size={18} className="flex-shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

function Sidebar({ nav, collapsed, setCollapsed }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <aside className={`flex flex-col h-full bg-white border-r border-surface-200 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-surface-100">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
          <Wrench size={16} className="text-white" />
        </div>
        {!collapsed && <span className="font-display font-bold text-surface-900 text-lg">RepairLink</span>}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-0.5">
        {nav.map(item => <NavItem key={item.to} item={item} collapsed={collapsed} />)}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-surface-100">
        <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-surface-50 transition-colors ${collapsed ? 'justify-center' : ''}`}>
          <Avatar name={user?.name} size="sm" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-surface-800 truncate">{user?.name}</p>
              <p className="text-[10px] text-surface-400 capitalize">{user?.role}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} className="p-1 hover:bg-surface-100 rounded-lg transition-colors" title="Logout">
              <LogOut size={14} className="text-surface-400" />
            </button>
          )}
        </div>
        {collapsed && (
          <button onClick={handleLogout} className="w-full flex justify-center p-2 hover:bg-surface-50 rounded-xl transition-colors mt-1" title="Logout">
            <LogOut size={16} className="text-surface-400" />
          </button>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-surface-200 rounded-full flex items-center justify-center shadow-soft hover:bg-surface-50 transition-colors z-10"
      >
        <ChevronRight size={12} className={`text-surface-400 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
      </button>
    </aside>
  );
}

function TopBar({ title, actions }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 bg-white">
      <h1 className="page-title">{title}</h1>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function AppLayout({ children, nav, title, actions }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar - hidden on mobile */}
      <div className={`relative flex-shrink-0 z-50 hidden lg:flex`}>
        <Sidebar nav={nav} collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed left-0 top-0 h-full z-50 flex lg:hidden transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="relative w-60">
          <Sidebar nav={nav} collapsed={false} setCollapsed={() => {}} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-surface-100 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-1.5 rounded-lg hover:bg-surface-100">
              <Menu size={20} className="text-surface-600" />
            </button>
            <h1 className="page-title">{title}</h1>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}

export function CustomerLayout({ children, title, actions }) {
  return <AppLayout nav={customerNav} title={title} actions={actions}>{children}</AppLayout>;
}

export function ProviderLayout({ children, title, actions }) {
  return <AppLayout nav={providerNav} title={title} actions={actions}>{children}</AppLayout>;
}

export function AdminLayout({ children, title, actions }) {
  return <AppLayout nav={adminNav} title={title} actions={actions}>{children}</AppLayout>;
}
