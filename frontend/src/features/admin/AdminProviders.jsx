import { useState } from 'react';
import { Search, CheckCircle, XCircle, Star } from 'lucide-react';
import { AdminLayout } from '../../layouts/AppLayout';
import { Avatar, Card, ConfirmDialog } from '../../components/ui';

const PROVIDERS = [
  { _id: '1', name: 'TechFix Pro', email: 'techfix@example.com', city: 'Chennai', categories: ['mobile','laptop'], rating: 4.8, jobs: 134, status: 'approved' },
  { _id: '2', name: 'QuickRepair Chennai', email: 'qr@example.com', city: 'Chennai', categories: ['mobile'], rating: 4.3, jobs: 87, status: 'approved' },
  { _id: '3', name: 'iCare Solutions', email: 'icare@example.com', city: 'Bangalore', categories: ['mobile','laptop'], rating: null, jobs: 0, status: 'pending' },
  { _id: '4', name: 'ProFix Hub', email: 'profix@example.com', city: 'Hyderabad', categories: ['pc','laptop'], rating: null, jobs: 0, status: 'pending' },
  { _id: '5', name: 'DeviceDoc', email: 'dd@example.com', city: 'Coimbatore', categories: ['console','mobile'], rating: 4.6, jobs: 52, status: 'approved' },
];

export function AdminProviders() {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null);

  const filtered = PROVIDERS.filter(p => {
    const matchTab = tab === 'all' ? true : p.status === tab;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <AdminLayout title="Providers">
      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1">
          {[{ k:'all',l:'All' }, { k:'approved',l:'Approved' }, { k:'pending',l:'Pending' }].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${tab===t.k ? 'bg-brand-500 text-white' : 'text-surface-500 hover:bg-surface-100'}`}>{t.l}</button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search providers..." className="input pl-9 text-sm" />
        </div>
      </div>

      <Card padding={false}>
        <table className="w-full">
          <thead className="border-b border-surface-100 bg-surface-50">
            <tr>
              <th className="table-header">Provider</th>
              <th className="table-header">City</th>
              <th className="table-header">Categories</th>
              <th className="table-header">Rating</th>
              <th className="table-header">Total Jobs</th>
              <th className="table-header">Status</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p._id} className="table-row">
                <td className="table-cell">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={p.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-surface-900">{p.name}</p>
                      <p className="text-xs text-surface-400">{p.email}</p>
                    </div>
                  </div>
                </td>
                <td className="table-cell text-sm text-surface-600">{p.city}</td>
                <td className="table-cell">
                  <div className="flex flex-wrap gap-1">
                    {p.categories.map(c => <span key={c} className="px-1.5 py-0.5 bg-surface-100 text-surface-600 text-[10px] rounded capitalize">{c}</span>)}
                  </div>
                </td>
                <td className="table-cell">
                  {p.rating ? <span className="flex items-center gap-1 text-sm"><Star size={12} className="text-amber-400" />{p.rating}</span> : <span className="text-xs text-surface-400">—</span>}
                </td>
                <td className="table-cell text-sm text-surface-600">{p.jobs}</td>
                <td className="table-cell">
                  <span className={`badge border ${p.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{p.status}</span>
                </td>
                <td className="table-cell">
                  <div className="flex gap-1">
                    {p.status === 'pending' && <button onClick={() => setConfirm({ p, action: 'approve' })} className="btn-ghost py-1 px-2 text-xs text-green-600 hover:bg-green-50"><CheckCircle size={13} /> Approve</button>}
                    {p.status === 'approved' && <button onClick={() => setConfirm({ p, action: 'suspend' })} className="btn-ghost py-1 px-2 text-xs text-red-500 hover:bg-red-50"><XCircle size={13} /> Suspend</button>}
                    {p.status === 'pending' && <button className="btn-ghost py-1 px-2 text-xs text-red-500 hover:bg-red-50"><XCircle size={13} /> Reject</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <ConfirmDialog
        open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => setConfirm(null)}
        title={confirm?.action === 'approve' ? 'Approve Provider' : 'Suspend Provider'}
        message={`Are you sure you want to ${confirm?.action} ${confirm?.p?.name}?`}
        confirmLabel={confirm?.action === 'approve' ? 'Approve' : 'Suspend'}
        danger={confirm?.action === 'suspend'}
      />
    </AdminLayout>
  );
}
