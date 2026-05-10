import { useNavigate } from 'react-router-dom';
import { Users, Ticket, ShieldCheck, DollarSign, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';
import { AdminLayout } from '../../layouts/AppLayout';
import { StatCard, Card, StatusBadge, DeviceIcon, Avatar } from '../../components/ui';

const RECENT_TICKETS = [
  { _id: '1', ticketNo: 'TKT-2025-MOB-00035', issueTitle: 'Galaxy boot loop', deviceType: 'mobile', status: 'open', customer: 'Deepa R', createdAt: '30 min ago' },
  { _id: '2', ticketNo: 'TKT-2025-LAP-00019', issueTitle: 'Keyboard water damage', deviceType: 'laptop', status: 'in_repair', customer: 'Surya P', createdAt: '2h ago' },
  { _id: '3', ticketNo: 'TKT-2025-CON-00012', issueTitle: 'PS5 HDMI port', deviceType: 'console', status: 'bids_received', customer: 'Arjun M', createdAt: '4h ago' },
  { _id: '4', ticketNo: 'TKT-2025-PC-00007', issueTitle: 'GPU fan noise', deviceType: 'pc', status: 'assigned', customer: 'Karthik V', createdAt: '6h ago' },
];

const PENDING_PROVIDERS = [
  { name: 'iCare Solutions', city: 'Bangalore', categories: ['mobile', 'laptop'], appliedAt: '1 day ago' },
  { name: 'ProFix Hub', city: 'Hyderabad', categories: ['pc', 'laptop'], appliedAt: '2 days ago' },
];

const REV_WEEK = [12000, 18000, 14000, 22000, 19000, 25000, 21000];
const DAYS = ['M','T','W','T','F','S','S'];
const maxR = Math.max(...REV_WEEK);

export function AdminDashboard() {
  const navigate = useNavigate();
  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} iconBg="bg-blue-50" iconColor="text-blue-600" label="Total Users" value="1,284" trend={8} />
        <StatCard icon={ShieldCheck} iconBg="bg-green-50" iconColor="text-green-600" label="Active Providers" value="67" trend={3} />
        <StatCard icon={Ticket} iconBg="bg-amber-50" iconColor="text-amber-600" label="Open Tickets" value="34" />
        <StatCard icon={DollarSign} iconBg="bg-purple-50" iconColor="text-purple-600" label="Platform Revenue" value="₹1.2L" trend={15} sub="This month" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Recent tickets */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">Recent Tickets</h3>
              <button onClick={() => navigate('/admin/tickets')} className="text-xs text-brand-600 font-medium flex items-center gap-1">View all <ArrowRight size={12} /></button>
            </div>
            <Card padding={false}>
              <table className="w-full">
                <thead className="border-b border-surface-100 bg-surface-50">
                  <tr>
                    <th className="table-header">Ticket</th>
                    <th className="table-header">Customer</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Raised</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_TICKETS.map(t => (
                    <tr key={t._id} className="table-row cursor-pointer" onClick={() => navigate(`/admin/tickets/${t._id}`)}>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <DeviceIcon type={t.deviceType} className="h-3.5 w-3.5 text-surface-400" />
                          <div>
                            <p className="text-xs font-mono text-surface-500">{t.ticketNo}</p>
                            <p className="text-sm text-surface-800">{t.issueTitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell text-sm text-surface-600">{t.customer}</td>
                      <td className="table-cell"><StatusBadge status={t.status} /></td>
                      <td className="table-cell text-xs text-surface-400">{t.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          {/* Revenue */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">Weekly Revenue</h3>
              <span className="text-sm font-semibold text-surface-700">₹1,31,000</span>
            </div>
            <div className="flex items-end gap-2 h-24">
              {REV_WEEK.map((v, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-full rounded-t-md relative overflow-hidden bg-surface-100" style={{ height: '72px' }}>
                    <div className="absolute bottom-0 left-0 right-0 bg-brand-500 rounded-t-md" style={{ height: `${(v/maxR)*100}%` }} />
                  </div>
                  <span className="text-[10px] text-surface-400">{DAYS[i]}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Provider approvals */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">Pending Approvals</h3>
              <span className="badge bg-red-50 text-red-600 border border-red-200">{PENDING_PROVIDERS.length}</span>
            </div>
            <div className="flex flex-col gap-3">
              {PENDING_PROVIDERS.map((p, i) => (
                <Card key={i} padding={false} className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar name={p.name} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-surface-900">{p.name}</p>
                      <p className="text-xs text-surface-400">{p.city} · {p.appliedAt}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.categories.map(c => <span key={c} className="px-1.5 py-0.5 bg-surface-100 text-surface-500 text-[10px] rounded capitalize">{c}</span>)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-primary flex-1 justify-center text-xs py-1.5">Approve</button>
                    <button className="btn-secondary text-xs py-1.5 px-3">Reject</button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Platform health */}
          <Card>
            <h3 className="section-title mb-4">Platform Health</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Tickets resolved today', value: '14', good: true },
                { label: 'Avg bid response time', value: '3.2h', good: true },
                { label: 'Open disputes', value: '2', good: false },
                { label: 'Provider uptime', value: '98%', good: true },
              ].map(m => (
                <div key={m.label} className="flex items-center justify-between">
                  <span className="text-xs text-surface-500">{m.label}</span>
                  <span className={`text-sm font-semibold ${m.good ? 'text-green-600' : 'text-red-500'}`}>{m.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
