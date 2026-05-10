import { useState } from 'react';
import { Search, UserCheck, UserX } from 'lucide-react';
import { AdminLayout } from '../../layouts/AppLayout';
import { Avatar, Card, EmptyState, Pagination, ConfirmDialog } from '../../components/ui';

const MOCK_USERS = [
  { _id: '1', name: 'Vikram Sundar', email: 'vikram@example.com', phone: '+91 98765 43210', role: 'customer', status: 'active', joined: '2025-01-15', tickets: 5 },
  { _id: '2', name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 87654 32109', role: 'customer', status: 'active', joined: '2025-02-10', tickets: 3 },
  { _id: '3', name: 'TechFix Pro', email: 'techfix@example.com', phone: '+91 76543 21098', role: 'provider', status: 'active', joined: '2025-01-05', tickets: 47 },
  { _id: '4', name: 'Arjun Mehta', email: 'arjun@example.com', phone: '+91 65432 10987', role: 'customer', status: 'suspended', joined: '2025-03-20', tickets: 1 },
  { _id: '5', name: 'QuickRepair Chennai', email: 'qr@example.com', phone: '+91 54321 09876', role: 'provider', status: 'active', joined: '2025-02-28', tickets: 23 },
  { _id: '6', name: 'Deepa Rajan', email: 'deepa@example.com', phone: '+91 43210 98765', role: 'customer', status: 'active', joined: '2025-04-01', tickets: 2 },
];

export function AdminUsers() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirm, setConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const filtered = MOCK_USERS.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const paginated = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  return (
    <AdminLayout title="Users">
      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="input pl-9 text-sm" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input w-auto text-sm">
          <option value="all">All Roles</option>
          <option value="customer">Customers</option>
          <option value="provider">Providers</option>
          <option value="admin">Admins</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-auto text-sm">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <Card padding={false}>
        <table className="w-full">
          <thead className="border-b border-surface-100 bg-surface-50">
            <tr>
              <th className="table-header">User</th>
              <th className="table-header">Role</th>
              <th className="table-header">Status</th>
              <th className="table-header"># Tickets/Jobs</th>
              <th className="table-header">Joined</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(u => (
              <tr key={u._id} className="table-row">
                <td className="table-cell">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={u.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-surface-900">{u.name}</p>
                      <p className="text-xs text-surface-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="table-cell">
                  <span className={`badge border capitalize ${u.role === 'provider' ? 'bg-purple-50 text-purple-700 border-purple-200' : u.role === 'admin' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{u.role}</span>
                </td>
                <td className="table-cell">
                  <span className={`badge border ${u.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{u.status}</span>
                </td>
                <td className="table-cell text-sm text-surface-600">{u.tickets}</td>
                <td className="table-cell text-sm text-surface-500">{u.joined}</td>
                <td className="table-cell">
                  <button onClick={() => setConfirm(u)} className={`btn-ghost py-1 px-2 text-xs ${u.status === 'active' ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
                    {u.status === 'active' ? <><UserX size={13} /> Suspend</> : <><UserCheck size={13} /> Reactivate</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-12 text-center text-sm text-surface-400">No users found</div>}
      </Card>
      <Pagination page={page} totalPages={Math.ceil(filtered.length / PER_PAGE)} onChange={setPage} />

      <ConfirmDialog
        open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => setConfirm(null)}
        title={confirm?.status === 'active' ? 'Suspend User' : 'Reactivate User'}
        message={`Are you sure you want to ${confirm?.status === 'active' ? 'suspend' : 'reactivate'} ${confirm?.name}?`}
        confirmLabel={confirm?.status === 'active' ? 'Suspend' : 'Reactivate'}
        danger={confirm?.status === 'active'}
      />
    </AdminLayout>
  );
}
