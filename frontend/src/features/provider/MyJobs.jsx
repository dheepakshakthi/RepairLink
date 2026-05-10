import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock } from 'lucide-react';
import { ProviderLayout } from '../../layouts/AppLayout';
import { StatusBadge, DeviceIcon, UrgencyBadge, EmptyState, Card } from '../../components/ui';

const MOCK_JOBS = [
  { _id: '1', ticketNo: 'TKT-2025-MOB-00023', issueTitle: 'Screen cracked, touch not responding', deviceType: 'mobile', deviceBrand: 'Samsung', deviceModel: 'Galaxy S23', status: 'in_repair', urgency: 'high', quotedPrice: 3200, estimatedDays: 2, customer: 'Vikram S', assignedAt: new Date(Date.now() - 86400000) },
  { _id: '2', ticketNo: 'TKT-2025-LAP-00011', issueTitle: 'Overheating and shutting down', deviceType: 'laptop', deviceBrand: 'Dell', deviceModel: 'XPS 15', status: 'device_received', urgency: 'medium', quotedPrice: 1200, estimatedDays: 3, customer: 'Ananya K', assignedAt: new Date(Date.now() - 2 * 86400000) },
  { _id: '3', ticketNo: 'TKT-2025-PC-00003', issueTitle: 'PC won\'t POST, no display', deviceType: 'pc', deviceBrand: 'Custom', deviceModel: 'i9 Desktop', status: 'assigned', urgency: 'high', quotedPrice: 4500, estimatedDays: 2, customer: 'Rahul M', assignedAt: new Date(Date.now() - 3600000) },
  { _id: '4', ticketNo: 'TKT-2025-MOB-00015', issueTitle: 'Battery swollen, phone not booting', deviceType: 'mobile', deviceBrand: 'OnePlus', deviceModel: '11 Pro', status: 'repair_complete', urgency: 'high', quotedPrice: 2100, estimatedDays: 1, customer: 'Meena R', assignedAt: new Date(Date.now() - 3 * 86400000) },
  { _id: '5', ticketNo: 'TKT-2025-LAP-00007', issueTitle: 'Keyboard water damage', deviceType: 'laptop', deviceBrand: 'Apple', deviceModel: 'MacBook Pro 14"', status: 'delivered', urgency: 'medium', quotedPrice: 5500, estimatedDays: 4, customer: 'Surya P', assignedAt: new Date(Date.now() - 7 * 86400000) },
];

const TABS = [
  { key: 'all', label: 'All Jobs' },
  { key: 'active', label: 'Active' },
  { key: 'complete', label: 'Completed' },
];

const ACTIVE = ['assigned','pickup_scheduled','device_in_transit','device_received','in_repair','repair_complete','return_in_transit'];

export function MyJobs() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_JOBS.filter(j => {
    const matchTab = tab === 'all' ? true : tab === 'active' ? ACTIVE.includes(j.status) : ['delivered','closed'].includes(j.status);
    const matchSearch = !search || j.issueTitle.toLowerCase().includes(search.toLowerCase()) || j.ticketNo.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const timeAgo = (d) => {
    const h = Math.round((Date.now() - new Date(d).getTime()) / 3600000);
    if (h < 24) return `${h}h ago`;
    return `${Math.round(h / 24)}d ago`;
  };

  return (
    <ProviderLayout title="My Jobs">
      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-brand-500 text-white' : 'text-surface-500 hover:bg-surface-100'}`}>{t.label}</button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs..." className="input pl-9 text-sm" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No jobs found" description="When customers accept your bids, jobs will appear here." />
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="border-b border-surface-100 bg-surface-50">
              <tr>
                <th className="table-header">Device</th>
                <th className="table-header">Issue</th>
                <th className="table-header">Customer</th>
                <th className="table-header">Status</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Assigned</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(job => (
                <tr key={job._id} className="table-row cursor-pointer" onClick={() => navigate(`/provider/jobs/${job._id}`)}>
                  <td className="table-cell">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center flex-shrink-0">
                        <DeviceIcon type={job.deviceType} className="h-3.5 w-3.5 text-surface-500" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-surface-800">{job.deviceBrand} {job.deviceModel}</p>
                        <p className="text-[10px] font-mono text-surface-400">{job.ticketNo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <p className="text-sm text-surface-800 max-w-[200px] truncate">{job.issueTitle}</p>
                    <UrgencyBadge urgency={job.urgency} />
                  </td>
                  <td className="table-cell text-sm text-surface-600">{job.customer}</td>
                  <td className="table-cell"><StatusBadge status={job.status} /></td>
                  <td className="table-cell font-semibold text-surface-800">₹{job.quotedPrice?.toLocaleString()}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1 text-xs text-surface-400">
                      <Clock size={11} />{timeAgo(job.assignedAt)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ProviderLayout>
  );
}
