import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Save, User, Phone, Mail, Lock } from 'lucide-react';
import { CustomerLayout } from '../../layouts/AppLayout';
import { Card, Field, Avatar, Alert } from '../../components/ui';

export function Profile() {
  const { user } = useSelector(s => s.auth);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: user?.name || 'John Doe', phone: user?.phone || '', email: user?.email || '' });
  const [pwForm, setPwForm] = useState({ current: '', newPass: '', confirm: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setPw = (k, v) => setPwForm(p => ({ ...p, [k]: v }));
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <CustomerLayout title="Profile" actions={<button onClick={save} className="btn-primary"><Save size={16} />Save Changes</button>}>
      {saved && <Alert type="success" className="mb-4">Profile updated!</Alert>}
      <div className="max-w-2xl flex flex-col gap-5">
        <Card className="flex items-center gap-4">
          <Avatar name={form.name} size="xl" />
          <div>
            <p className="font-semibold text-surface-900 text-lg">{form.name}</p>
            <p className="text-sm text-surface-400 capitalize">{user?.role || 'customer'}</p>
            <p className="text-xs text-surface-400 mt-1">{form.email}</p>
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-surface-800 mb-4">Personal Information</h3>
          <div className="flex flex-col gap-4">
            <Field label="Full Name" required>
              <div className="relative"><User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" /><input value={form.name} onChange={e => set('name', e.target.value)} className="input pl-9" /></div>
            </Field>
            <Field label="Email Address">
              <div className="relative"><Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" /><input value={form.email} className="input pl-9" readOnly /></div>
              <p className="text-xs text-surface-400 mt-1">Email cannot be changed. Contact support if needed.</p>
            </Field>
            <Field label="Phone Number">
              <div className="relative"><Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" /><input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" className="input pl-9" /></div>
            </Field>
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-surface-800 mb-4">Change Password</h3>
          <div className="flex flex-col gap-4">
            <Field label="Current Password"><input type="password" value={pwForm.current} onChange={e => setPw('current', e.target.value)} className="input" placeholder="••••••••" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="New Password"><input type="password" value={pwForm.newPass} onChange={e => setPw('newPass', e.target.value)} className="input" placeholder="Min 8 chars" /></Field>
              <Field label="Confirm Password"><input type="password" value={pwForm.confirm} onChange={e => setPw('confirm', e.target.value)} className="input" placeholder="Repeat password" /></Field>
            </div>
            <button className="btn-secondary w-fit"><Lock size={14} />Update Password</button>
          </div>
        </Card>
      </div>
    </CustomerLayout>
  );
}
