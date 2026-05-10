import { DollarSign, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { ProviderLayout } from '../../layouts/AppLayout';
import { StatCard, Card } from '../../components/ui';

const TXN = [
  { id: 1, ticket: 'TKT-2025-MOB-00023', desc: 'Screen replacement – Samsung Galaxy S23', amount: 3200, date: '2025-06-05', status: 'paid' },
  { id: 2, ticket: 'TKT-2025-LAP-00011', desc: 'Thermal paste & cleaning – Dell XPS 15', amount: 1200, date: '2025-06-03', status: 'paid' },
  { id: 3, ticket: 'TKT-2025-MOB-00015', desc: 'Battery replacement – OnePlus 11 Pro', amount: 2100, date: '2025-06-01', status: 'paid' },
  { id: 4, ticket: 'TKT-2025-PC-00003', desc: 'Diagnostics & repair – i9 Desktop', amount: 4500, date: '2025-06-08', status: 'pending' },
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun'];
const REV = [28000, 34000, 29000, 45000, 52000, 71000];
const maxRev = Math.max(...REV);

export function Earnings() {
  return (
    <ProviderLayout title="Earnings">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={DollarSign} iconBg="bg-green-50" iconColor="text-green-600" label="This Month" value="₹71,000" trend={22} />
        <StatCard icon={TrendingUp} iconBg="bg-brand-50" iconColor="text-brand-600" label="Total Earned" value="₹2,59,000" />
        <StatCard icon={CheckCircle} iconBg="bg-purple-50" iconColor="text-purple-600" label="Jobs Paid" value="119" />
        <StatCard icon={Clock} iconBg="bg-amber-50" iconColor="text-amber-600" label="Pending" value="₹4,500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-surface-800 mb-4">Monthly Revenue (2025)</h3>
          <div className="flex items-end gap-3 h-40">
            {REV.map((v, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-[10px] text-surface-500">₹{(v/1000).toFixed(0)}k</span>
                <div className="w-full rounded-t-lg relative overflow-hidden" style={{ height: '96px', background: '#f0f2f8' }}>
                  <div className="absolute bottom-0 left-0 right-0 bg-brand-500 rounded-t-lg" style={{ height: `${(v/maxRev)*100}%` }} />
                </div>
                <span className="text-[10px] text-surface-400">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Stats */}
        <Card>
          <h3 className="text-sm font-semibold text-surface-800 mb-4">Breakdown</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Mobile repairs', pct: 54, color: 'bg-brand-500' },
              { label: 'Laptop repairs', pct: 28, color: 'bg-purple-500' },
              { label: 'PC repairs', pct: 12, color: 'bg-green-500' },
              { label: 'Console repairs', pct: 6, color: 'bg-amber-500' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-surface-600">{item.label}</span>
                  <span className="font-semibold text-surface-800">{item.pct}%</span>
                </div>
                <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Transactions */}
        <div className="lg:col-span-3">
          <h3 className="section-title mb-4">Recent Transactions</h3>
          <Card padding={false}>
            <table className="w-full">
              <thead className="border-b border-surface-100 bg-surface-50">
                <tr>
                  <th className="table-header">Ticket</th>
                  <th className="table-header">Description</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {TXN.map(t => (
                  <tr key={t.id} className="table-row">
                    <td className="table-cell font-mono text-xs text-surface-500">{t.ticket}</td>
                    <td className="table-cell text-sm text-surface-700 max-w-[280px] truncate">{t.desc}</td>
                    <td className="table-cell text-sm text-surface-500">{t.date}</td>
                    <td className="table-cell">
                      <span className={`badge border ${t.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="table-cell text-right font-semibold text-surface-900">₹{t.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </ProviderLayout>
  );
}
