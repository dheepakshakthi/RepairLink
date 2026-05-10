import { useState } from 'react';
import { useSelector } from 'react-redux';
import { MapPin, Phone, Mail, Clock, Save } from 'lucide-react';
import { ProviderLayout } from '../../layouts/AppLayout';
import { Card, Avatar, Field, Alert } from '../../components/ui';

export function ProviderProfile() {
  const { user } = useSelector(s => s.auth);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    shopName: user?.shopName || 'TechFix Pro',
    description: 'We specialize in all kinds of mobile and laptop repairs. Genuine parts, quick turnaround, and transparent pricing.',
    phone: user?.phone || '+91 98765 43210',
    address: { street: '45, T. Nagar, GST Road', city: 'Chennai', state: 'Tamil Nadu', pincode: '600017' },
    serviceCategories: ['mobile', 'laptop', 'pc'],
    workingHours: { open: '09:00', close: '19:00' },
    warrantyDays: 30,
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setAddr = (k, v) => setForm(p => ({ ...p, address: { ...p.address, [k]: v } }));
  const toggleCat = (c) => setForm(p => ({ ...p, serviceCategories: p.serviceCategories.includes(c) ? p.serviceCategories.filter(x => x !== c) : [...p.serviceCategories, c] }));

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <ProviderLayout title="Shop Profile" actions={<button onClick={save} className="btn-primary"><Save size={16} />Save Changes</button>}>
      {saved && <Alert type="success" className="mb-4">Profile saved successfully!</Alert>}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left: avatar + quick info */}
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col items-center text-center py-6">
            <Avatar name={form.shopName} size="xl" className="mb-3" />
            <p className="font-semibold text-surface-900">{form.shopName}</p>
            <p className="text-sm text-surface-400">Verified Provider</p>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-amber-400 text-sm">★★★★★</span>
              <span className="text-sm text-surface-600">4.8</span>
            </div>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-surface-800 mb-3">Categories Served</h3>
            <div className="flex flex-wrap gap-2">
              {['mobile','laptop','pc','console'].map(c => (
                <button key={c} onClick={() => toggleCat(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${form.serviceCategories.includes(c) ? 'bg-brand-50 border-brand-400 text-brand-700' : 'border-surface-200 text-surface-500 hover:border-surface-300'}`}>{c}</button>
              ))}
            </div>
          </Card>
          <Card>
            <Field label="Warranty (days)">
              <input type="number" value={form.warrantyDays} onChange={e => set('warrantyDays', e.target.value)} className="input" min="0" />
            </Field>
          </Card>
        </div>

        {/* Right: form fields */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card>
            <h3 className="text-sm font-semibold text-surface-800 mb-4">Shop Information</h3>
            <div className="flex flex-col gap-4">
              <Field label="Shop Name" required>
                <input value={form.shopName} onChange={e => set('shopName', e.target.value)} className="input" />
              </Field>
              <Field label="Description">
                <textarea value={form.description} onChange={e => set('description', e.target.value)} className="input h-24 resize-none" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Phone">
                  <div className="relative"><Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" /><input value={form.phone} onChange={e => set('phone', e.target.value)} className="input pl-9" /></div>
                </Field>
                <Field label="Email">
                  <div className="relative"><Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" /><input value={user?.email || 'shop@example.com'} className="input pl-9" readOnly /></div>
                </Field>
              </div>
            </div>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-surface-800 mb-4">Shop Address</h3>
            <div className="flex flex-col gap-3">
              <Field label="Street"><input value={form.address.street} onChange={e => setAddr('street', e.target.value)} className="input" /></Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="City"><input value={form.address.city} onChange={e => setAddr('city', e.target.value)} className="input" /></Field>
                <Field label="State"><input value={form.address.state} onChange={e => setAddr('state', e.target.value)} className="input" /></Field>
                <Field label="Pincode"><input value={form.address.pincode} onChange={e => setAddr('pincode', e.target.value)} className="input" maxLength={6} /></Field>
              </div>
            </div>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-surface-800 mb-4">Working Hours</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Opens at"><input type="time" value={form.workingHours.open} onChange={e => set('workingHours', { ...form.workingHours, open: e.target.value })} className="input" /></Field>
              <Field label="Closes at"><input type="time" value={form.workingHours.close} onChange={e => set('workingHours', { ...form.workingHours, close: e.target.value })} className="input" /></Field>
            </div>
          </Card>
        </div>
      </div>
    </ProviderLayout>
  );
}
