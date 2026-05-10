import { BarChart3, TrendingUp, Users, Ticket } from 'lucide-react';
import { AdminLayout } from '../../layouts/AppLayout';
import { StatCard, Card } from '../../components/ui';

const MON = ['Jan','Feb','Mar','Apr','May','Jun'];
const TICKETS_DATA = [28, 35, 31, 48, 55, 62];
const REV_DATA = [85000, 102000, 94000, 138000, 165000, 210000];
const maxT = Math.max(...TICKETS_DATA);
const maxR = Math.max(...REV_DATA);

const DEVICE_DATA = [
  { label: 'Mobile', pct: 48, count: 187, color: 'bg-blue-500' },
  { label: 'Laptop', pct: 31, count: 121, color: 'bg-purple-500' },
  { label: 'PC', pct: 13, count: 51, color: 'bg-green-500' },
  { label: 'Console', pct: 8, count: 31, color: 'bg-amber-500' },
];

const TOP_PROVIDERS = [
  { name: 'TechFix Pro', jobs: 134, revenue: '₹4.2L', rating: 4.8 },
  { name: 'QuickRepair Chennai', jobs: 87, revenue: '₹2.1L', rating: 4.3 },
  { name: 'DeviceDoc', jobs: 52, revenue: '₹1.4L', rating: 4.6 },
  { name: 'ProFix Hub', jobs: 38, revenue: '₹98K', rating: 4.1 },
];

export function AdminAnalytics() {
  return (
    <AdminLayout title="Analytics">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Ticket} iconBg="bg-blue-50" iconColor="text-blue-600" label="Total Tickets" value="390" trend={13} />
        <StatCard icon={Users} iconBg="bg-green-50" iconColor="text-green-600" label="New Users (Month)" value="+84" trend={22} />
        <StatCard icon={TrendingUp} iconBg="bg-purple-50" iconColor="text-purple-600" label="Avg Ticket Value" value="₹2,340" trend={5} />
        <StatCard icon={BarChart3} iconBg="bg-amber-50" iconColor="text-amber-600" label="Resolution Rate" value="91%" trend={3} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Ticket volume */}
        <Card>
          <h3 className="text-sm font-semibold text-surface-800 mb-4">Ticket Volume (2025)</h3>
          <div className="flex items-end gap-3 h-36">
            {TICKETS_DATA.map((v, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-[10px] text-surface-500">{v}</span>
                <div className="w-full rounded-t-lg bg-surface-100 relative overflow-hidden" style={{ height: '96px' }}>
                  <div className="absolute bottom-0 left-0 right-0 bg-brand-500 rounded-t-lg" style={{ height: `${(v/maxT)*100}%` }} />
                </div>
                <span className="text-[10px] text-surface-400">{MON[i]}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Revenue */}
        <Card>
          <h3 className="text-sm font-semibold text-surface-800 mb-4">Platform Revenue (2025)</h3>
          <div className="flex items-end gap-3 h-36">
            {REV_DATA.map((v, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-[10px] text-surface-500">₹{(v/1000).toFixed(0)}k</span>
                <div className="w-full rounded-t-lg bg-surface-100 relative overflow-hidden" style={{ height: '96px' }}>
                  <div className="absolute bottom-0 left-0 right-0 bg-green-500 rounded-t-lg" style={{ height: `${(v/maxR)*100}%` }} />
                </div>
                <span className="text-[10px] text-surface-400">{MON[i]}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Device breakdown */}
        <Card>
          <h3 className="text-sm font-semibold text-surface-800 mb-4">Repairs by Device Type</h3>
          <div className="flex flex-col gap-3">
            {DEVICE_DATA.map(d => (
              <div key={d.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-surface-600">{d.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-surface-400">{d.count} tickets</span>
                    <span className="text-sm font-semibold text-surface-800 w-10 text-right">{d.pct}%</span>
                  </div>
                </div>
                <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                  <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top providers */}
        <Card>
          <h3 className="text-sm font-semibold text-surface-800 mb-4">Top Performing Providers</h3>
          <div className="flex flex-col gap-3">
            {TOP_PROVIDERS.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-surface-100 flex items-center justify-center text-xs font-bold text-surface-500 flex-shrink-0">{i+1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-surface-900">{p.name}</p>
                  <p className="text-xs text-surface-400">{p.jobs} jobs · ★ {p.rating}</p>
                </div>
                <span className="text-sm font-semibold text-surface-700">{p.revenue}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
