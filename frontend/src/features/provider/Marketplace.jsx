import { useState } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import { ProviderLayout } from '../../layouts/AppLayout';
import { DeviceIcon, UrgencyBadge, Avatar, EmptyState, Pagination, Card } from '../../components/ui';

const MOCK = [
  { _id: '1', ticketNo: 'TKT-2025-MOB-00031', issueTitle: 'iPhone charging port not working', issueDescription: 'Phone won\'t charge at all, tried multiple cables. Started 3 days ago.', deviceType: 'mobile', deviceBrand: 'Apple', deviceModel: 'iPhone 13 Pro', urgency: 'medium', budgetMin: 500, budgetMax: 1000, customerId: { name: 'Priya Sharma' }, pickupAddress: { city: 'Chennai' }, createdAt: new Date(Date.now() - 3600000), bids: [] },
  { _id: '2', ticketNo: 'TKT-2025-CON-00012', issueTitle: 'PS5 HDMI port damaged — no display', issueDescription: 'HDMI port is physically bent. No signal to TV.', deviceType: 'console', deviceBrand: 'Sony', deviceModel: 'PlayStation 5', urgency: 'high', budgetMin: 1000, budgetMax: 2500, customerId: { name: 'Arjun Mehta' }, pickupAddress: { city: 'Coimbatore' }, createdAt: new Date(Date.now() - 2 * 3600000), bids: [{ _id: 'x' }] },
  { _id: '3', ticketNo: 'TKT-2025-LAP-00018', issueTitle: 'Broken hinge, lid won\'t stay open', issueDescription: 'The hinge on the left side snapped. Screen falls back.', deviceType: 'laptop', deviceBrand: 'Lenovo', deviceModel: 'ThinkPad X1 Carbon', urgency: 'low', budgetMin: 800, budgetMax: 2000, customerId: { name: 'Ravi Kumar' }, pickupAddress: { city: 'Madurai' }, createdAt: new Date(Date.now() - 5 * 3600000), bids: [] },
  { _id: '4', ticketNo: 'TKT-2025-MOB-00035', issueTitle: 'Samsung Galaxy boot loop', issueDescription: 'Phone keeps restarting and stuck at Samsung logo.', deviceType: 'mobile', deviceBrand: 'Samsung', deviceModel: 'Galaxy S22', urgency: 'high', budgetMin: 1500, budgetMax: 3000, customerId: { name: 'Deepa R' }, pickupAddress: { city: 'Chennai' }, createdAt: new Date(Date.now() - 30 * 60000), bids: [] },
  { _id: '5', ticketNo: 'TKT-2025-PC-00007', issueTitle: 'GPU fan making grinding noise', issueDescription: 'RTX 3080 fan very loud, temps okay but fan is dying.', deviceType: 'pc', deviceBrand: 'Custom Build', deviceModel: 'i9 Gaming PC', urgency: 'medium', budgetMin: 500, budgetMax: 1200, customerId: { name: 'Karthik V' }, pickupAddress: { city: 'Trichy' }, createdAt: new Date(Date.now() - 7 * 3600000), bids: [{ _id: 'y' }, { _id: 'z' }] },
];

function BidModal({ ticket, onClose }) {
  const [form, setForm] = useState({ quotedPrice: '', estimatedDays: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = () => {
    setSubmitting(true);
    setTimeout(() => { setDone(true); setSubmitting(false); }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card p-6 w-full max-w-md">
        {done ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">✓</span>
            </div>
            <h3 className="text-base font-semibold text-surface-900 mb-1">Bid Submitted!</h3>
            <p className="text-sm text-surface-500 mb-4">The customer will be notified of your bid.</p>
            <button onClick={onClose} className="btn-primary">Done</button>
          </div>
        ) : (
          <>
            <h3 className="text-base font-semibold text-surface-900 mb-1">Submit a Bid</h3>
            <p className="text-xs text-surface-500 mb-4">for {ticket.issueTitle}</p>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Quoted Price (₹) *</label>
                  <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">₹</span><input type="number" value={form.quotedPrice} onChange={e => setForm(p => ({...p, quotedPrice: e.target.value}))} className="input pl-7" placeholder="2500" /></div>
                </div>
                <div>
                  <label className="label">Est. Days *</label>
                  <input type="number" value={form.estimatedDays} onChange={e => setForm(p => ({...p, estimatedDays: e.target.value}))} className="input" placeholder="2" min="1" />
                </div>
              </div>
              <div>
                <label className="label">Notes for customer</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} className="input h-24 resize-none" placeholder="Describe your approach, parts used, warranty offered..." />
              </div>
              <div className="flex gap-2">
                <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                <button onClick={submit} disabled={!form.quotedPrice || !form.estimatedDays || submitting} className="btn-primary flex-1 justify-center">
                  {submitting ? '...' : 'Submit Bid'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function Marketplace() {
  const [search, setSearch] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [bidding, setBidding] = useState(null);
  const [page, setPage] = useState(1);

  const filtered = MOCK.filter(t => {
    const matchSearch = !search || t.issueTitle.toLowerCase().includes(search.toLowerCase()) || t.deviceBrand.toLowerCase().includes(search.toLowerCase()) || t.pickupAddress.city.toLowerCase().includes(search.toLowerCase());
    const matchDevice = deviceFilter === 'all' || t.deviceType === deviceFilter;
    const matchUrgency = urgencyFilter === 'all' || t.urgency === urgencyFilter;
    return matchSearch && matchDevice && matchUrgency;
  });

  const timeAgo = (d) => {
    const diff = Date.now() - new Date(d).getTime();
    if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
    return `${Math.round(diff / 86400000)}d ago`;
  };

  return (
    <ProviderLayout title="Marketplace">
      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by issue, brand, or city..." className="input pl-9 text-sm" />
        </div>
        <select value={deviceFilter} onChange={e => setDeviceFilter(e.target.value)} className="input w-auto text-sm">
          <option value="all">All Devices</option>
          <option value="mobile">Mobile</option>
          <option value="laptop">Laptop</option>
          <option value="pc">Desktop PC</option>
          <option value="console">Console</option>
        </select>
        <select value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value)} className="input w-auto text-sm">
          <option value="all">All Urgency</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No tickets found" description="Try adjusting your filters." />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(ticket => (
            <Card key={ticket._id} className="flex flex-col gap-3 p-5" padding={false}>
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0">
                    <DeviceIcon type={ticket.deviceType} className="h-4 w-4 text-surface-500" />
                  </div>
                  <div>
                    <p className="text-xs font-mono text-surface-400">{ticket.ticketNo}</p>
                    <p className="text-xs text-surface-400">{ticket.deviceBrand} {ticket.deviceModel}</p>
                  </div>
                </div>
                <UrgencyBadge urgency={ticket.urgency} />
              </div>

              {/* Title + desc */}
              <div>
                <p className="text-sm font-semibold text-surface-900 mb-1">{ticket.issueTitle}</p>
                <p className="text-xs text-surface-500 line-clamp-2">{ticket.issueDescription}</p>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-3 text-xs text-surface-400">
                <span className="flex items-center gap-1"><MapPin size={11} />{ticket.pickupAddress.city}</span>
                <span>·</span>
                <span>{timeAgo(ticket.createdAt)}</span>
                <span>·</span>
                <span>{ticket.bids.length} bid{ticket.bids.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Budget + CTA */}
              <div className="flex items-center justify-between pt-2 border-t border-surface-100">
                <div>
                  <p className="text-[10px] text-surface-400">Budget</p>
                  <p className="text-sm font-semibold text-surface-800">₹{ticket.budgetMin?.toLocaleString()} – ₹{ticket.budgetMax?.toLocaleString()}</p>
                </div>
                <button onClick={() => setBidding(ticket)} className="btn-primary py-1.5 text-xs">Place Bid</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {bidding && <BidModal ticket={bidding} onClose={() => setBidding(null)} />}
    </ProviderLayout>
  );
}
