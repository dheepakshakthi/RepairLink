import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Laptop, Monitor, Gamepad2, ChevronRight, ChevronLeft, Check, Upload, X, AlertCircle } from 'lucide-react';
import { CustomerLayout } from '../../layouts/AppLayout';
import { Field, Alert, LoadingSpinner, StepIndicator } from '../../components/ui';
import api from '../../services/api';

const STEPS = ['Device', 'Problem', 'Preferences', 'Review'];

const DEVICE_TYPES = [
  { value: 'mobile', label: 'Mobile / Tablet', icon: Smartphone, brands: ['Samsung', 'Apple', 'OnePlus', 'Xiaomi', 'Oppo', 'Vivo', 'Realme'] },
  { value: 'laptop', label: 'Laptop', icon: Laptop, brands: ['Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Apple', 'MSI'] },
  { value: 'pc', label: 'Desktop PC', icon: Monitor, brands: ['Custom Build', 'Dell', 'HP', 'Lenovo', 'Asus'] },
  { value: 'console', label: 'Gaming Console', icon: Gamepad2, brands: ['Sony', 'Microsoft', 'Nintendo'] },
];

const URGENCY = [
  { value: 'low', label: 'Low priority', desc: 'Happy to wait 5–7 days', color: 'border-green-200 bg-green-50 text-green-700' },
  { value: 'medium', label: 'Medium priority', desc: 'Need it within 3–4 days', color: 'border-amber-200 bg-amber-50 text-amber-700' },
  { value: 'high', label: 'Urgent', desc: 'Need it within 1–2 days', color: 'border-red-200 bg-red-50 text-red-700' },
];

export function RaiseTicket() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    deviceType: '', deviceBrand: '', deviceModel: '', deviceSerial: '',
    issueTitle: '', issueDescription: '', urgency: 'medium',
    budgetMin: '', budgetMax: '', preferredHandover: 'pickup',
    pickupAddress: { street: '', city: '', state: '', zipCode: '' },
  });

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const setAddr = (key, val) => setForm(p => ({ ...p, pickupAddress: { ...p.pickupAddress, [key]: val } }));

  const canNext = () => {
    if (step === 0) return form.deviceType && form.deviceBrand && form.deviceModel;
    if (step === 1) return form.issueTitle.length >= 5 && form.issueDescription.length >= 20;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      const payload = {
        ...form,
        budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
        budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
      };
      const res = await api.post('/tickets', payload);
      // api interceptor unwraps axios .data, so res = ApiResponse { data: ticket }
      const id = res.data?._id || res._id;
      if (!id) throw new Error('No ticket ID returned');
      navigate(`/customer/tickets/${id}`);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create ticket. Please try again.');
      setLoading(false);
    }
  };

  const selectedDevice = DEVICE_TYPES.find(d => d.value === form.deviceType);

  return (
    <CustomerLayout title="Raise a Repair Ticket">
      <div className="max-w-2xl mx-auto">
        {/* Step indicator */}
        <div className="card p-5 mb-5">
          <StepIndicator steps={STEPS} current={step} />
        </div>

        {/* Step content */}
        <div className="card p-6 page-enter">
          {error && <Alert type="error" className="mb-4">{error}</Alert>}

          {/* Step 0: Device */}
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-semibold text-surface-900 mb-1">What device needs repair?</h2>
                <p className="text-sm text-surface-500">Select the type of device you need repaired.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {DEVICE_TYPES.map(({ value, label, icon: Icon }) => (
                  <button key={value} onClick={() => set('deviceType', value)}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2.5 transition-all ${
                      form.deviceType === value ? 'border-brand-500 bg-brand-50' : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50'
                    }`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${form.deviceType === value ? 'bg-brand-100' : 'bg-surface-100'}`}>
                      <Icon size={22} className={form.deviceType === value ? 'text-brand-600' : 'text-surface-500'} />
                    </div>
                    <span className={`text-sm font-medium ${form.deviceType === value ? 'text-brand-700' : 'text-surface-700'}`}>{label}</span>
                  </button>
                ))}
              </div>

              {form.deviceType && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                  <Field label="Brand" required>
                    <select value={form.deviceBrand} onChange={e => set('deviceBrand', e.target.value)} className="input">
                      <option value="">Select brand</option>
                      {selectedDevice?.brands.map(b => <option key={b} value={b}>{b}</option>)}
                      <option value="Other">Other</option>
                    </select>
                  </Field>
                  <Field label="Model" required>
                    <input value={form.deviceModel} onChange={e => set('deviceModel', e.target.value)} placeholder="e.g. Galaxy S23 Ultra" className="input" />
                  </Field>
                  <Field label="Serial / IMEI" className="col-span-2">
                    <input value={form.deviceSerial} onChange={e => set('deviceSerial', e.target.value)} placeholder="Optional — helps providers identify your device" className="input" />
                  </Field>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Problem */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-semibold text-surface-900 mb-1">Describe the problem</h2>
                <p className="text-sm text-surface-500">Be specific — better descriptions attract more accurate bids.</p>
              </div>

              <Field label="Issue title" required>
                <input value={form.issueTitle} onChange={e => set('issueTitle', e.target.value)}
                  placeholder="e.g. Screen cracked and touch not responding" className="input" maxLength={100} />
                <p className="text-[10px] text-surface-400 mt-1">{form.issueTitle.length}/100</p>
              </Field>

              <Field label="Detailed description" required>
                <textarea value={form.issueDescription} onChange={e => set('issueDescription', e.target.value)}
                  placeholder="Describe when the issue started, what happened, any error messages, etc. The more detail you provide, the better the quotes you'll receive."
                  className="input h-32 resize-none" />
                <p className={`text-[10px] mt-1 ${form.issueDescription.length < 20 ? 'text-red-400' : 'text-surface-400'}`}>
                  {form.issueDescription.length} chars (min 20)
                </p>
              </Field>

              <Field label="Urgency">
                <div className="flex flex-col gap-2">
                  {URGENCY.map(u => (
                    <button key={u.value} onClick={() => set('urgency', u.value)} type="button"
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${form.urgency === u.value ? u.color + ' border-current' : 'border-surface-200 hover:border-surface-300'}`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${form.urgency === u.value ? 'border-current' : 'border-surface-300'}`}>
                        {form.urgency === u.value && <div className="w-2 h-2 rounded-full bg-current" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{u.label}</p>
                        <p className="text-xs opacity-70">{u.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* Step 2: Preferences */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-semibold text-surface-900 mb-1">Set your preferences</h2>
                <p className="text-sm text-surface-500">Help providers understand your budget and logistics.</p>
              </div>

              <div>
                <p className="label">Budget range (₹)</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Minimum">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm">₹</span>
                      <input type="number" value={form.budgetMin} onChange={e => set('budgetMin', e.target.value)} placeholder="500" className="input pl-7" min="0" />
                    </div>
                  </Field>
                  <Field label="Maximum">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm">₹</span>
                      <input type="number" value={form.budgetMax} onChange={e => set('budgetMax', e.target.value)} placeholder="5000" className="input pl-7" min="0" />
                    </div>
                  </Field>
                </div>
              </div>

              <Field label="Preferred handover method">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { v: 'pickup', l: 'Pickup & delivery', d: 'We come to you' },
                    { v: 'dropoff', l: 'Drop off at shop', d: 'You visit the shop' }
                  ].map(opt => (
                    <button key={opt.v} onClick={() => set('preferredHandover', opt.v)} type="button"
                      className={`p-3 rounded-xl border-2 text-left transition-all ${form.preferredHandover === opt.v ? 'border-brand-500 bg-brand-50' : 'border-surface-200 hover:border-surface-300'}`}>
                      <p className={`text-sm font-medium ${form.preferredHandover === opt.v ? 'text-brand-700' : 'text-surface-700'}`}>{opt.l}</p>
                      <p className="text-xs text-surface-400 mt-0.5">{opt.d}</p>
                    </button>
                  ))}
                </div>
              </Field>

              {form.preferredHandover === 'pickup' && (
                <div className="flex flex-col gap-3 animate-fade-in">
                  <p className="label">Pickup address</p>
                  <Field label="Street address">
                    <input value={form.pickupAddress.street} onChange={e => setAddr('street', e.target.value)} placeholder="123 Main Street, Apartment 4B" className="input" />
                  </Field>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="City">
                      <input value={form.pickupAddress.city} onChange={e => setAddr('city', e.target.value)} placeholder="Chennai" className="input" />
                    </Field>
                    <Field label="State">
                      <input value={form.pickupAddress.state} onChange={e => setAddr('state', e.target.value)} placeholder="Tamil Nadu" className="input" />
                    </Field>
                    <Field label="Pincode">
                      <input value={form.pickupAddress.zipCode} onChange={e => setAddr('zipCode', e.target.value)} placeholder="600001" className="input" maxLength={6} />
                    </Field>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-semibold text-surface-900 mb-1">Review your ticket</h2>
                <p className="text-sm text-surface-500">Everything looks good? Submit to start receiving bids.</p>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { label: 'Device', value: `${form.deviceBrand} ${form.deviceModel} (${form.deviceType})`, step: 0 },
                  { label: 'Issue', value: form.issueTitle, step: 1 },
                  { label: 'Description', value: form.issueDescription, step: 1 },
                  { label: 'Urgency', value: URGENCY.find(u => u.value === form.urgency)?.label, step: 1 },
                  { label: 'Budget', value: form.budgetMin && form.budgetMax ? `₹${form.budgetMin} – ₹${form.budgetMax}` : 'Not specified', step: 2 },
                  { label: 'Handover', value: form.preferredHandover === 'pickup' ? 'Pickup & Delivery' : 'Drop off at shop', step: 2 },
                ].map(row => (
                  <div key={row.label} className="flex items-start justify-between gap-4 py-2.5 border-b border-surface-100 last:border-0">
                    <span className="text-sm text-surface-500 w-24 flex-shrink-0">{row.label}</span>
                    <span className="text-sm text-surface-800 font-medium flex-1 text-right">{row.value}</span>
                    <button onClick={() => setStep(row.step)} className="text-xs text-brand-600 hover:text-brand-700 flex-shrink-0">Edit</button>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-brand-50 rounded-xl border border-brand-100">
                <p className="text-xs text-brand-700 leading-relaxed">
                  <strong>What happens next:</strong> Your ticket will be visible to approved providers. You'll receive bids within 24 hours. Once you accept a bid, the provider will coordinate pickup.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/customer/dashboard')} className="btn-secondary">
            <ChevronLeft size={16} /> {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="btn-primary">
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="btn-primary">
              {loading ? <LoadingSpinner size="sm" /> : <Check size={16} />}
              Submit Ticket
            </button>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
