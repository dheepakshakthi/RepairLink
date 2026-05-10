import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Wrench, Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, CheckCircle, Smartphone, Laptop, Monitor, Gamepad2 } from 'lucide-react';
import { login, register } from './authSlice';
import { Field, Alert, LoadingSpinner } from '../../components/ui';

function AuthLayout({ children, title, subtitle, side }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 bg-brand-950 text-white p-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-400 flex items-center justify-center">
            <Wrench size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl">RepairLink</span>
        </div>
        <div className="space-y-6">
          {side}
        </div>
        <div className="flex items-center gap-2 text-brand-300 text-sm">
          <CheckCircle size={16} />
          <span>Trusted by 10,000+ customers across India</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Wrench size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-surface-900">RepairLink</span>
          </div>
          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-surface-900 mb-1">{title}</h1>
            <p className="text-surface-500 text-sm">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
export function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(s => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(login(form));
    if (res.meta.requestStatus === 'fulfilled') {
      const role = res.payload.user?.role;
      if (role === 'provider') navigate('/provider/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/customer/dashboard');
    }
  };

  const features = [
    { icon: Smartphone, text: 'Mobile & Tablet Repairs' },
    { icon: Laptop, text: 'Laptop & Computer Fixes' },
    { icon: Gamepad2, text: 'Gaming Console Repairs' },
    { icon: Monitor, text: 'Desktop PC Repairs' },
  ];

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your RepairLink account"
      side={
        <>
          <div>
            <h2 className="text-3xl font-display font-bold mb-3">Fix your device,<br/>stress-free.</h2>
            <p className="text-brand-200 text-sm leading-relaxed">Connect with trusted repair professionals near you. Get competitive bids, track your repair in real-time, and have your device returned to your door.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="bg-brand-900/50 rounded-xl p-3 flex items-center gap-2.5">
                <Icon size={16} className="text-brand-300 flex-shrink-0" />
                <span className="text-brand-100 text-xs font-medium">{text}</span>
              </div>
            ))}
          </div>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <Alert type="error">{error}</Alert>}

        <Field label="Email address" required>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="email" value={form.email} placeholder="you@example.com"
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="input pl-10" required
            />
          </div>
        </Field>

        <Field label="Password" required>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type={showPass ? 'text' : 'password'} value={form.password} placeholder="••••••••"
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className="input pl-10 pr-10" required
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-surface-500 cursor-pointer">
            <input type="checkbox" className="rounded" />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-sm text-brand-600 hover:text-brand-700 font-medium">Forgot password?</Link>
        </div>

        <button type="submit" className="btn-primary justify-center py-3" disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : <>Sign in <ArrowRight size={16} /></>}
        </button>

        <p className="text-center text-sm text-surface-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-600 font-medium hover:text-brand-700">Create one free</Link>
        </p>
      </form>

      {/* Demo accounts */}
      <div className="mt-6 p-4 bg-surface-100 rounded-xl">
        <p className="text-xs font-semibold text-surface-600 mb-2">Demo accounts</p>
        <div className="flex flex-col gap-1">
          {[
            { role: 'Customer', email: 'customer@demo.com' },
            { role: 'Provider', email: 'provider@demo.com' },
            { role: 'Admin', email: 'admin@demo.com' },
          ].map(d => (
            <button key={d.role} onClick={() => setForm({ email: d.email, password: 'Demo@1234' })}
              className="text-left text-xs text-surface-500 hover:text-brand-600 transition-colors py-0.5">
              <span className="font-medium text-surface-700">{d.role}:</span> {d.email} / Demo@1234
            </button>
          ))}
        </div>
      </div>
    </AuthLayout>
  );
}

// ─── Register Page ────────────────────────────────────────────────────────────
export function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(s => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'customer', shopName: '', serviceCategories: [] });
  const [showPass, setShowPass] = useState(false);
  const [success, setSuccess] = useState(false);

  const categories = ['mobile', 'laptop', 'pc', 'console'];
  const toggleCat = (c) => setForm(p => ({
    ...p, serviceCategories: p.serviceCategories.includes(c) ? p.serviceCategories.filter(x => x !== c) : [...p.serviceCategories, c]
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(register(form));
    if (res.meta.requestStatus === 'fulfilled') setSuccess(true);
  };

  const strength = (() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^a-zA-Z0-9]/.test(p)) s++;
    return s;
  })();

  if (success) return (
    <AuthLayout title="Check your email" subtitle="" side={<></>}>
      <div className="flex flex-col items-center text-center py-6">
        <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h2 className="text-xl font-semibold text-surface-900 mb-2">Account created!</h2>
        <p className="text-sm text-surface-500 mb-6">We've sent a verification link to <strong>{form.email}</strong>. Click it to activate your account.</p>
        <Link to="/login" className="btn-primary">Go to Login</Link>
      </div>
    </AuthLayout>
  );

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join RepairLink and get your devices fixed"
      side={
        <>
          <div>
            <h2 className="text-3xl font-display font-bold mb-3">Join 10,000+<br/>happy customers.</h2>
            <p className="text-brand-200 text-sm leading-relaxed">Whether you need a repair or run a repair shop, RepairLink makes the process seamless, transparent, and fair.</p>
          </div>
          <div className="space-y-3">
            {['Post your problem for free', 'Get competitive bids within 24h', 'Track repair in real-time', 'Doorstep pickup & delivery'].map(f => (
              <div key={f} className="flex items-center gap-2.5 text-brand-100 text-sm">
                <CheckCircle size={16} className="text-brand-400 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <Alert type="error">{error}</Alert>}

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-2">
          {[{ v: 'customer', l: 'I need a repair', d: 'Device owner' }, { v: 'provider', l: 'I run a shop', d: 'Repair business' }].map(r => (
            <button key={r.v} type="button" onClick={() => setForm(p => ({ ...p, role: r.v }))}
              className={`p-3 rounded-xl border-2 text-left transition-all ${form.role === r.v ? 'border-brand-500 bg-brand-50' : 'border-surface-200 hover:border-surface-300'}`}>
              <p className={`text-sm font-semibold ${form.role === r.v ? 'text-brand-700' : 'text-surface-800'}`}>{r.l}</p>
              <p className="text-xs text-surface-400 mt-0.5">{r.d}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Full name" required>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
              <input type="text" value={form.name} placeholder="John Doe" onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input pl-10" required />
            </div>
          </Field>
          <Field label="Phone">
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
              <input type="tel" value={form.phone} placeholder="+91 98765..." onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="input pl-10" />
            </div>
          </Field>
        </div>

        <Field label="Email address" required>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input type="email" value={form.email} placeholder="you@example.com" onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="input pl-10" required />
          </div>
        </Field>

        <Field label="Password" required>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input type={showPass ? 'text' : 'password'} value={form.password} placeholder="Min 8 chars, one uppercase & number"
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="input pl-10 pr-10" required />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {form.password && (
            <div className="flex gap-1 mt-1">
              {[0,1,2,3].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < strength ? ['bg-red-400','bg-amber-400','bg-amber-400','bg-green-500'][strength-1] : 'bg-surface-200'}`} />
              ))}
            </div>
          )}
        </Field>

        {form.role === 'provider' && (
          <>
            <Field label="Shop name" required>
              <input type="text" value={form.shopName} placeholder="e.g. TechFix Chennai" onChange={e => setForm(p => ({ ...p, shopName: e.target.value }))} className="input" required />
            </Field>
            <Field label="Device categories you service">
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <button key={c} type="button" onClick={() => toggleCat(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${form.serviceCategories.includes(c) ? 'bg-brand-50 border-brand-400 text-brand-700' : 'border-surface-200 text-surface-600 hover:border-surface-300'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </Field>
          </>
        )}

        <button type="submit" className="btn-primary justify-center py-3" disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : <>Create account <ArrowRight size={16} /></>}
        </button>

        <p className="text-center text-sm text-surface-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:text-brand-700">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
