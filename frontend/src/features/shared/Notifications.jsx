import { useState } from 'react';
import { Bell, CheckCheck, Ticket, Star, Truck, DollarSign } from 'lucide-react';
import { CustomerLayout } from '../../layouts/AppLayout';
import { EmptyState } from '../../components/ui';

const MOCK_NOTIFS = [
  { _id:'1', type:'bid', title:'New bid received', message:'TechFix Pro has placed a bid of ₹3,200 on your ticket TKT-2025-MOB-00023', time:'10 minutes ago', read: false },
  { _id:'2', type:'status', title:'Device picked up', message:'Your Samsung Galaxy S23 has been picked up by TechFix Pro for repair', time:'2 hours ago', read: false },
  { _id:'3', type:'review', title:'Please leave a review', message:'Your repair is complete! Rate your experience with QuickRepair Chennai', time:'1 day ago', read: true },
  { _id:'4', type:'status', title:'Repair completed', message:'Your Dell XPS 15 repair is complete and ready for return delivery', time:'2 days ago', read: true },
  { _id:'5', type:'bid', title:'Bid accepted', message:'Your bid on TKT-2025-LAP-00011 has been accepted. Coordinate pickup with the customer.', time:'3 days ago', read: true },
];

const ICONS = {
  bid: { icon: DollarSign, bg: 'bg-green-50', color: 'text-green-600' },
  status: { icon: Truck, bg: 'bg-blue-50', color: 'text-blue-600' },
  review: { icon: Star, bg: 'bg-amber-50', color: 'text-amber-600' },
};

export function Notifications() {
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);
  const unread = notifs.filter(n => !n.read).length;

  const markAllRead = () => setNotifs(p => p.map(n => ({ ...n, read: true })));
  const markRead = (id) => setNotifs(p => p.map(n => n._id === id ? { ...n, read: true } : n));

  return (
    <CustomerLayout title="Notifications" actions={
      unread > 0 && <button onClick={markAllRead} className="btn-ghost text-xs"><CheckCheck size={14} />Mark all read</button>
    }>
      <div className="max-w-2xl mx-auto">
        {notifs.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
        ) : (
          <div className="flex flex-col gap-2">
            {notifs.map(n => {
              const { icon: Icon, bg, color } = ICONS[n.type] || ICONS.status;
              return (
                <div key={n._id} onClick={() => markRead(n._id)}
                  className={`card p-4 flex items-start gap-3 cursor-pointer transition-all hover:shadow-card ${!n.read ? 'border-brand-200 bg-brand-50/30' : ''}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                    <Icon size={16} className={color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${!n.read ? 'text-surface-900' : 'text-surface-700'}`}>{n.title}</p>
                      {!n.read && <span className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0 mt-1" />}
                    </div>
                    <p className="text-sm text-surface-500 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-surface-400 mt-1.5">{n.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
