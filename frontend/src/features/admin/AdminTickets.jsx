import { useState } from 'react';
import { Search } from 'lucide-react';
import { AdminLayout } from '../../layouts/AppLayout';
import { StatusBadge, UrgencyBadge, DeviceIcon, Card, Pagination } from '../../components/ui';

const ALL_TICKETS = [
  { _id:'1', ticketNo:'TKT-2025-MOB-00035', issueTitle:'Galaxy boot loop', deviceType:'mobile', deviceBrand:'Samsung', status:'open', urgency:'high', customer:'Deepa R', provider:null, createdAt:'2025-06-08' },
  { _id:'2', ticketNo:'TKT-2025-MOB-00023', issueTitle:'Screen cracked', deviceType:'mobile', deviceBrand:'Samsung', status:'in_repair', urgency:'high', customer:'Vikram S', provider:'TechFix Pro', createdAt:'2025-06-06' },
  { _id:'3', ticketNo:'TKT-2025-LAP-00011', issueTitle:'Overheating laptop', deviceType:'laptop', deviceBrand:'Dell', status:'device_received', urgency:'medium', customer:'Ananya K', provider:'TechFix Pro', createdAt:'2025-06-04' },
  { _id:'4', ticketNo:'TKT-2025-CON-00012', issueTitle:'PS5 HDMI port', deviceType:'console', deviceBrand:'Sony', status:'bids_received', urgency:'medium', customer:'Arjun M', provider:null, createdAt:'2025-06-04' },
  { _id:'5', ticketNo:'TKT-2025-PC-00003', issueTitle:'PC won\'t POST', deviceType:'pc', deviceBrand:'Custom', status:'assigned', urgency:'high', customer:'Rahul M', provider:'ProFix Hub', createdAt:'2025-06-07' },
  { _id:'6', ticketNo:'TKT-2025-MOB-00019', issueTitle:'Battery draining fast', deviceType:'mobile', deviceBrand:'Apple', status:'delivered', urgency:'medium', customer:'Meena R', provider:'QuickRepair', createdAt:'2025-06-01' },
  { _id:'7', ticketNo:'TKT-2025-LAP-00007', issueTitle:'Water damage keyboard', deviceType:'laptop', deviceBrand:'Apple', status:'closed', urgency:'high', customer:'Surya P', provider:'TechFix Pro', createdAt:'2025-05-28' },
];

export function AdminTickets() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [page, setPage] = useState(1);
  const PER = 10;

  const filtered = ALL_TICKETS.filter(t => {
    const matchSearch = !search || t.ticketNo.toLowerCase().includes(search.toLowerCase()) || t.issueTitle.toLowerCase().includes(search.toLowerCase()) || t.customer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchDevice = deviceFilter === 'all' || t.deviceType === deviceFilter;
    return matchSearch && matchStatus && matchDevice;
  });

  const paginated = filtered.slice((page-1)*PER, page*PER);

  return (
    <AdminLayout title="All Tickets">
      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets..." className="input pl-9 text-sm" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-auto text-sm">
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="bids_received">Bids Received</option>
          <option value="in_repair">In Repair</option>
          <option value="delivered">Delivered</option>
          <option value="closed">Closed</option>
        </select>
        <select value={deviceFilter} onChange={e => setDeviceFilter(e.target.value)} className="input w-auto text-sm">
          <option value="all">All Devices</option>
          <option value="mobile">Mobile</option>
          <option value="laptop">Laptop</option>
          <option value="pc">PC</option>
          <option value="console">Console</option>
        </select>
      </div>

      <Card padding={false}>
        <table className="w-full">
          <thead className="border-b border-surface-100 bg-surface-50">
            <tr>
              <th className="table-header">Ticket</th>
              <th className="table-header">Customer</th>
              <th className="table-header">Provider</th>
              <th className="table-header">Status</th>
              <th className="table-header">Urgency</th>
              <th className="table-header">Date</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(t => (
              <tr key={t._id} className="table-row cursor-pointer">
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <DeviceIcon type={t.deviceType} className="h-3.5 w-3.5 text-surface-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-mono text-surface-400">{t.ticketNo}</p>
                      <p className="text-sm text-surface-800 max-w-[180px] truncate">{t.issueTitle}</p>
                    </div>
                  </div>
                </td>
                <td className="table-cell text-sm text-surface-600">{t.customer}</td>
                <td className="table-cell text-sm text-surface-500">{t.provider || <span className="text-surface-300">Unassigned</span>}</td>
                <td className="table-cell"><StatusBadge status={t.status} /></td>
                <td className="table-cell"><UrgencyBadge urgency={t.urgency} /></td>
                <td className="table-cell text-xs text-surface-400">{t.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-12 text-center text-sm text-surface-400">No tickets found</div>}
      </Card>
      <Pagination page={page} totalPages={Math.ceil(filtered.length/PER)} onChange={setPage} />
    </AdminLayout>
  );
}
