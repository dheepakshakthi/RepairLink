import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, MapPin, Clock, Wrench, Star, MessageSquare, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { CustomerLayout } from '../../layouts/AppLayout';
import api from '../../services/api';
import { StatusBadge, UrgencyBadge, DeviceIcon, BidCard, StatusStepper, Alert, Card, Avatar, LoadingSpinner } from '../../components/ui';

const MOCK = {
  _id: '1', ticketNo: 'TKT-2025-MOB-00023', issueTitle: 'Screen cracked, touch not responding',
  issueDescription: 'Dropped my phone, screen has a big crack and the touch screen stopped working in the bottom half. The display is still on but very dim. The phone still turns on.',
  deviceType: 'mobile', deviceBrand: 'Samsung', deviceModel: 'Galaxy S23', deviceSerial: 'R58N12XYZ',
  status: 'in_repair', urgency: 'high', budgetMin: 2000, budgetMax: 4000,
  preferredHandover: 'pickup_delivery',
  pickupAddress: { street: '14, Anna Nagar 4th Street', city: 'Chennai', state: 'Tamil Nadu', pincode: '600040' },
  createdAt: new Date(Date.now() - 2 * 86400000),
  bids: [
    { _id: 'b1', status: 'accepted', quotedPrice: 3200, estimatedDays: 2, notes: 'We have genuine Samsung parts in stock. Quick turnaround guaranteed.', providerId: { shopName: 'TechFix Pro', rating: 4.8, totalJobs: 134 } },
    { _id: 'b2', status: 'rejected', quotedPrice: 2800, estimatedDays: 3, notes: 'Can do with compatible parts.', providerId: { shopName: 'QuickRepair Chennai', rating: 4.3, totalJobs: 87 } },
  ],
};

export function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBids, setShowBids] = useState(true);
  const [msg, setMsg] = useState('');

  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/tickets/' + id)
      .then(res => { setTicket(res.data); setLoading(false); })
      .catch(() => { setError('Failed to load ticket.'); setLoading(false); });
  }, [id]);

  if (loading) return <CustomerLayout title="Ticket Detail"><div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div></CustomerLayout>;
  if (error) return <CustomerLayout title="Ticket Detail"><Alert type="error">{error}</Alert></CustomerLayout>;
  if (!ticket) return <CustomerLayout title="Ticket Detail"><Alert type="error">Ticket not found</Alert></CustomerLayout>;

  return (
    <CustomerLayout
      title="Ticket Detail"
      actions={<button onClick={() => navigate('/customer/tickets')} className="btn-secondary"><ArrowLeft size={16} /> Back</button>}
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-5">
        {/* Header card */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                <DeviceIcon type={ticket.deviceType} className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-surface-900">{ticket.issueTitle}</h2>
                <p className="text-xs font-mono text-surface-400 mt-0.5">{ticket.ticketNo}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <UrgencyBadge urgency={ticket.urgency} />
              <StatusBadge status={ticket.status} showIcon size="lg" />
            </div>
          </div>

          {/* Progress stepper */}
          <div className="py-3 border-t border-surface-100">
            <StatusStepper status={ticket.status} />
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Main info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Issue description */}
            <Card>
              <h3 className="text-sm font-semibold text-surface-800 mb-3">Issue Description</h3>
              <p className="text-sm text-surface-600 leading-relaxed">{ticket.issueDescription}</p>
            </Card>

            {/* Bids */}
            <Card padding={false}>
              <button onClick={() => setShowBids(!showBids)} className="w-full flex items-center justify-between p-4 hover:bg-surface-50 rounded-t-2xl transition-colors">
                <h3 className="text-sm font-semibold text-surface-800">Bids Received ({(ticket.bids?.length ?? 0)})</h3>
                {showBids ? <ChevronUp size={16} className="text-surface-400" /> : <ChevronDown size={16} className="text-surface-400" />}
              </button>
              {showBids && (
                <div className="px-4 pb-4 flex flex-col gap-3">
                  {(ticket.bids || []).map(bid => (
                    <BidCard key={bid._id} bid={bid} isCustomer={user?.role === 'customer'} />
                  ))}
                </div>
              )}
            </Card>

            {/* Quick message */}
            <Card>
              <h3 className="text-sm font-semibold text-surface-800 mb-3">Message Provider</h3>
              <div className="flex gap-2">
                <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Ask something about your repair..." className="input flex-1 text-sm" />
                <button className="btn-primary px-3"><Send size={16} /></button>
              </div>
            </Card>
          </div>

          {/* Side info */}
          <div className="flex flex-col gap-4">
            {/* Device info */}
            <Card>
              <h3 className="text-sm font-semibold text-surface-800 mb-3">Device Details</h3>
              <div className="flex flex-col gap-2">
                {[
                  ['Brand', ticket.deviceBrand],
                  ['Model', ticket.deviceModel],
                  ['Type', ticket.deviceType],
                  ['Serial', ticket.deviceSerial || '—'],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-surface-400">{l}</span>
                    <span className="font-medium text-surface-700 capitalize">{v}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Budget */}
            <Card>
              <h3 className="text-sm font-semibold text-surface-800 mb-3">Budget & Preferences</h3>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">Budget</span>
                  <span className="font-medium text-surface-700">₹{ticket.budgetMin?.toLocaleString()} – ₹{ticket.budgetMax?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">Handover</span>
                  <span className="font-medium text-surface-700 capitalize">{ticket.preferredHandover?.replace('_', ' ')}</span>
                </div>
              </div>
            </Card>

            {/* Pickup address */}
            {ticket.pickupAddress?.street && (
              <Card>
                <div className="flex items-start gap-2 mb-2">
                  <MapPin size={14} className="text-surface-400 mt-0.5" />
                  <h3 className="text-sm font-semibold text-surface-800">Pickup Address</h3>
                </div>
                <p className="text-sm text-surface-600 leading-relaxed">
                  {ticket.pickupAddress.street},<br />
                  {ticket.pickupAddress.city}, {ticket.pickupAddress.state} – {ticket.pickupAddress.zipCode}
                </p>
              </Card>
            )}

            {/* Ticket meta */}
            <Card>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">Raised</span>
                  <span className="font-medium text-surface-700">{new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">Ticket ID</span>
                  <span className="font-mono text-xs text-surface-700">{ticket.ticketNo}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
