import { useState } from 'react';
import { Save } from 'lucide-react';
import { AdminLayout } from '../../layouts/AppLayout';
import { Card, Field, Alert } from '../../components/ui';

export function AdminSettings() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    platformName: 'RepairLink', supportEmail: 'support@repairlink.in',
    bidWindowHours: 24, maxBidsPerTicket: 10, platformFeePercent: 5,
    allowSelfRegistration: true, requireEmailVerification: true,
    autoCloseDeliveredDays: 7, maintenanceMode: false,
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <AdminLayout title="Settings" actions={<button onClick={save} className="btn-primary"><Save size={16} />Save Settings</button>}>
      {saved && <Alert type="success" className="mb-4">Settings saved!</Alert>}
      <div className="max-w-2xl flex flex-col gap-5">
        <Card>
          <h3 className="text-sm font-semibold text-surface-800 mb-4">General</h3>
          <div className="flex flex-col gap-4">
            <Field label="Platform Name"><input value={form.platformName} onChange={e => set('platformName', e.target.value)} className="input" /></Field>
            <Field label="Support Email"><input type="email" value={form.supportEmail} onChange={e => set('supportEmail', e.target.value)} className="input" /></Field>
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-surface-800 mb-4">Bidding Rules</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Bid window (hours)"><input type="number" value={form.bidWindowHours} onChange={e => set('bidWindowHours', e.target.value)} className="input" min="1" /></Field>
            <Field label="Max bids per ticket"><input type="number" value={form.maxBidsPerTicket} onChange={e => set('maxBidsPerTicket', e.target.value)} className="input" min="1" /></Field>
            <Field label="Platform fee (%)" className="col-span-2"><input type="number" value={form.platformFeePercent} onChange={e => set('platformFeePercent', e.target.value)} className="input" min="0" max="100" /></Field>
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-surface-800 mb-4">User Settings</h3>
          <div className="flex flex-col gap-3">
            {[
              { k: 'allowSelfRegistration', l: 'Allow self-registration', d: 'Users can create accounts without admin approval' },
              { k: 'requireEmailVerification', l: 'Require email verification', d: 'New users must verify email before accessing the platform' },
            ].map(opt => (
              <label key={opt.k} className="flex items-start gap-3 cursor-pointer">
                <div className={`relative w-10 h-6 rounded-full transition-all flex-shrink-0 ${form[opt.k] ? 'bg-brand-500' : 'bg-surface-300'}`} onClick={() => set(opt.k, !form[opt.k])}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form[opt.k] ? 'left-5' : 'left-1'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-800">{opt.l}</p>
                  <p className="text-xs text-surface-400">{opt.d}</p>
                </div>
              </label>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-surface-800 mb-4">Automation</h3>
          <div className="flex flex-col gap-4">
            <Field label="Auto-close delivered tickets after (days)"><input type="number" value={form.autoCloseDeliveredDays} onChange={e => set('autoCloseDeliveredDays', e.target.value)} className="input" min="1" /></Field>
            <label className="flex items-start gap-3 cursor-pointer">
              <div className={`relative w-10 h-6 rounded-full transition-all flex-shrink-0 ${form.maintenanceMode ? 'bg-red-500' : 'bg-surface-300'}`} onClick={() => set('maintenanceMode', !form.maintenanceMode)}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.maintenanceMode ? 'left-5' : 'left-1'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-surface-800">Maintenance Mode</p>
                <p className="text-xs text-surface-400">Temporarily disable the platform for all non-admin users</p>
              </div>
            </label>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
