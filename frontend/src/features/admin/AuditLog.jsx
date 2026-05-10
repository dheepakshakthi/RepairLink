import { AdminLayout } from '../../layouts/AppLayout';
import { Card, Avatar } from '../../components/ui';

const LOGS = [
  { id:1, actor:'Admin', action:'PROVIDER_APPROVED', target:'TechFix Pro', details:'Provider approved and activated', time:'2025-06-08 14:32', ip:'103.21.x.x' },
  { id:2, actor:'System', action:'TICKET_AUTO_CLOSED', target:'TKT-2025-LAP-00003', details:'Ticket auto-closed after 7 days post delivery', time:'2025-06-08 12:00', ip:'—' },
  { id:3, actor:'Admin', action:'USER_SUSPENDED', target:'user@example.com', details:'User suspended for policy violation', time:'2025-06-07 17:15', ip:'103.21.x.x' },
  { id:4, actor:'System', action:'BID_EXPIRED', target:'TKT-2025-MOB-00028', details:'Bid window closed with no bids', time:'2025-06-07 10:00', ip:'—' },
  { id:5, actor:'Admin', action:'SETTING_CHANGED', target:'platformFeePercent', details:'Changed from 4% to 5%', time:'2025-06-06 09:45', ip:'103.21.x.x' },
  { id:6, actor:'Admin', action:'PROVIDER_REJECTED', target:'BadFix Inc', details:'Application rejected: unverifiable credentials', time:'2025-06-05 16:30', ip:'103.21.x.x' },
];

const ACTION_COLOR = {
  PROVIDER_APPROVED: 'bg-green-50 text-green-700',
  PROVIDER_REJECTED: 'bg-red-50 text-red-700',
  USER_SUSPENDED: 'bg-red-50 text-red-700',
  TICKET_AUTO_CLOSED: 'bg-surface-100 text-surface-600',
  BID_EXPIRED: 'bg-amber-50 text-amber-700',
  SETTING_CHANGED: 'bg-blue-50 text-blue-700',
};

export function AuditLog() {
  return (
    <AdminLayout title="Audit Log">
      <Card padding={false}>
        <table className="w-full">
          <thead className="border-b border-surface-100 bg-surface-50">
            <tr>
              <th className="table-header">Actor</th>
              <th className="table-header">Action</th>
              <th className="table-header">Target</th>
              <th className="table-header">Details</th>
              <th className="table-header">Time</th>
              <th className="table-header">IP</th>
            </tr>
          </thead>
          <tbody>
            {LOGS.map(log => (
              <tr key={log.id} className="table-row">
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <Avatar name={log.actor} size="sm" />
                    <span className="text-sm text-surface-700">{log.actor}</span>
                  </div>
                </td>
                <td className="table-cell">
                  <span className={`badge ${ACTION_COLOR[log.action] || 'bg-surface-100 text-surface-600'} text-[10px] font-mono`}>{log.action}</span>
                </td>
                <td className="table-cell text-sm text-surface-600 font-mono text-xs">{log.target}</td>
                <td className="table-cell text-sm text-surface-500 max-w-[240px] truncate">{log.details}</td>
                <td className="table-cell text-xs text-surface-400 whitespace-nowrap">{log.time}</td>
                <td className="table-cell text-xs text-surface-400">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AdminLayout>
  );
}
