import { Smartphone, Laptop, Monitor, Gamepad2, Loader2, PackageSearch, AlertCircle, CheckCircle, Clock, Truck, Wrench, ShieldCheck, XCircle, Ban, HelpCircle } from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS } from '../constants';

// ─── Status Badge ────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  blue:   'bg-blue-50   text-blue-700   border-blue-200',
  amber:  'bg-amber-50  text-amber-700  border-amber-200',
  green:  'bg-green-50  text-green-700  border-green-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  gray:   'bg-surface-100 text-surface-600 border-surface-200',
  red:    'bg-red-50    text-red-700    border-red-200',
};

const STATUS_ICONS = {
  open: Clock, bids_received: HelpCircle, assigned: CheckCircle,
  pickup_scheduled: Truck, device_in_transit: Truck, device_received: PackageSearch,
  in_repair: Wrench, repair_complete: CheckCircle, return_in_transit: Truck,
  delivered: ShieldCheck, closed: CheckCircle, cancelled: XCircle,
  disputed: AlertCircle, no_bids: Ban,
};

export function StatusBadge({ status, showIcon = false, size = 'sm' }) {
  const label = STATUS_LABELS[status] || status;
  const color = STATUS_COLORS[status] || 'gray';
  const style = STATUS_STYLES[color] || STATUS_STYLES.gray;
  const Icon = STATUS_ICONS[status];
  const sizeClass = size === 'lg' ? 'px-3 py-1 text-sm gap-1.5' : 'px-2.5 py-0.5 text-xs gap-1';
  return (
    <span className={`badge border ${style} ${sizeClass}`}>
      {showIcon && Icon && <Icon size={size === 'lg' ? 14 : 11} />}
      {label}
    </span>
  );
}

// ─── Urgency Badge ───────────────────────────────────────────────────────────
const URGENCY_STYLES = {
  low:    'bg-green-50  text-green-700  border-green-200',
  medium: 'bg-amber-50  text-amber-700  border-amber-200',
  high:   'bg-red-50    text-red-700    border-red-200',
};
export function UrgencyBadge({ urgency }) {
  return (
    <span className={`badge border ${URGENCY_STYLES[urgency] || URGENCY_STYLES.medium}`}>
      {urgency?.charAt(0).toUpperCase() + urgency?.slice(1)}
    </span>
  );
}

// ─── Device Icon ─────────────────────────────────────────────────────────────
export function DeviceIcon({ type, className = 'h-5 w-5' }) {
  const icons = { mobile: Smartphone, laptop: Laptop, pc: Monitor, console: Gamepad2 };
  const Icon = icons[type] || Smartphone;
  return <Icon className={className} />;
}

// ─── Loading Spinner ─────────────────────────────────────────────────────────
export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8', xl: 'h-12 w-12' };
  return <Loader2 className={`animate-spin text-brand-500 ${sizes[size]} ${className}`} />;
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-surface-500">Loading...</p>
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon = PackageSearch, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-surface-400" />
      </div>
      <h3 className="text-base font-semibold text-surface-800 mb-1">{title}</h3>
      {description && <p className="text-sm text-surface-500 mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
export function Avatar({ name, src, size = 'md', className = '' }) {
  const sizes = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-12 w-12 text-base', xl: 'h-16 w-16 text-xl' };
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || '?';
  const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-green-100 text-green-700', 'bg-amber-100 text-amber-700', 'bg-pink-100 text-pink-700'];
  const colorIdx = name ? name.charCodeAt(0) % colors.length : 0;
  if (src) return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover ${className}`} />;
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${colors[colorIdx]} ${className}`}>
      {initials}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', padding = true, hover = false }) {
  return (
    <div className={`card ${padding ? 'p-5' : ''} ${hover ? 'hover:shadow-card transition-shadow cursor-pointer' : ''} ${className}`}>
      {children}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ icon: Icon, iconColor = 'text-brand-500', iconBg = 'bg-brand-50', label, value, trend, sub }) {
  return (
    <Card className="flex items-start justify-between">
      <div>
        <p className="stat-label mb-2">{label}</p>
        <p className="stat-number">{value}</p>
        {sub && <p className="text-xs text-surface-400 mt-0.5">{sub}</p>}
        {trend !== undefined && (
          <span className={`text-xs font-medium mt-1 inline-block ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
          </span>
        )}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon size={20} className={iconColor} />
      </div>
    </Card>
  );
}

// ─── Input Field ──────────────────────────────────────────────────────────────
export function Field({ label, error, required, className = '', children }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="label">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      {children}
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
    </div>
  );
}

// ─── Alert ───────────────────────────────────────────────────────────────────
const ALERT_STYLES = {
  info:    'bg-blue-50   border-blue-200   text-blue-800',
  success: 'bg-green-50  border-green-200  text-green-800',
  warning: 'bg-amber-50  border-amber-200  text-amber-800',
  error:   'bg-red-50    border-red-200    text-red-800',
};
const ALERT_ICONS = { info: AlertCircle, success: CheckCircle, warning: AlertCircle, error: AlertCircle };

export function Alert({ type = 'info', title, children }) {
  const Icon = ALERT_ICONS[type];
  return (
    <div className={`flex gap-3 p-4 rounded-xl border ${ALERT_STYLES[type]}`}>
      <Icon size={18} className="flex-shrink-0 mt-0.5" />
      <div>
        {title && <p className="font-semibold text-sm mb-0.5">{title}</p>}
        <p className="text-sm">{children}</p>
      </div>
    </div>
  );
}

// ─── Progress Steps ───────────────────────────────────────────────────────────
export function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          <div className={`flex items-center gap-2 ${i <= current ? 'text-brand-600' : 'text-surface-400'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < current ? 'bg-brand-500 text-white' : i === current ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-400' : 'bg-surface-100 text-surface-400'
            }`}>
              {i < current ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span className="text-xs font-medium hidden sm:block">{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-px w-8 mx-2 sm:w-16 transition-all ${i < current ? 'bg-brand-400' : 'bg-surface-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Toast-like Notification Dot ─────────────────────────────────────────────
export function NotifDot({ count }) {
  if (!count) return null;
  return (
    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
      {count > 9 ? '9+' : count}
    </span>
  );
}

// ─── Ticket Card ──────────────────────────────────────────────────────────────
export function TicketCard({ ticket, onClick }) {
  return (
    <div onClick={onClick} className="card p-4 hover:shadow-card transition-all cursor-pointer group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
            <DeviceIcon type={ticket.deviceType} className="h-4 w-4 text-brand-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-surface-900 group-hover:text-brand-600 transition-colors">{ticket.issueTitle}</p>
            <p className="text-xs text-surface-400 font-mono">{ticket.ticketNo}</p>
          </div>
        </div>
        <StatusBadge status={ticket.status} />
      </div>
      <p className="text-xs text-surface-500 mb-3 line-clamp-2">{ticket.issueDescription}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-400">{ticket.deviceBrand} {ticket.deviceModel}</span>
          <span className="w-1 h-1 rounded-full bg-surface-300"></span>
          <UrgencyBadge urgency={ticket.urgency} />
        </div>
        {ticket.budgetMin && (
          <span className="text-xs font-medium text-surface-600">₹{ticket.budgetMin}–{ticket.budgetMax}</span>
        )}
      </div>
    </div>
  );
}

// ─── Provider Card ────────────────────────────────────────────────────────────
export function ProviderCard({ provider, onBid }) {
  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <Avatar name={provider.shopName} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-surface-900 truncate">{provider.shopName}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-yellow-500 text-xs">★</span>
            <span className="text-xs font-medium text-surface-700">{provider.rating?.toFixed(1)}</span>
            <span className="text-xs text-surface-400">({provider.totalReviews} reviews)</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {provider.serviceCategories?.map(c => (
              <span key={c} className="px-2 py-0.5 bg-surface-100 text-surface-600 text-xs rounded-full capitalize">{c}</span>
            ))}
          </div>
        </div>
      </div>
      {onBid && (
        <button onClick={onBid} className="btn-primary w-full justify-center">Submit Bid</button>
      )}
    </div>
  );
}

// ─── Skeleton Loader ─────────────────────────────────────────────────────────
export function Skeleton({ className = '' }) {
  return <div className={`bg-surface-100 animate-pulse rounded-lg ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false, loading = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm modal-backdrop" onClick={onClose} />
      <div className="relative card p-6 w-full max-w-sm page-enter">
        <h3 className="text-base font-semibold text-surface-900 mb-2">{title}</h3>
        <p className="text-sm text-surface-500 mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
          <button onClick={onConfirm} className={danger ? 'btn-danger' : 'btn-primary'} disabled={loading}>
            {loading && <LoadingSpinner size="sm" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Bid Card ─────────────────────────────────────────────────────────────────
export function BidCard({ bid, onAccept, onReject, isCustomer }) {
  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={bid.providerId?.shopName} />
          <div>
            <p className="text-sm font-semibold text-surface-900">{bid.providerId?.shopName}</p>
            <div className="flex items-center gap-1">
              <span className="text-yellow-500 text-xs">★</span>
              <span className="text-xs text-surface-600">{bid.providerId?.rating?.toFixed(1)}</span>
              <span className="text-xs text-surface-400">· {bid.providerId?.totalJobs} jobs</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-surface-900">₹{bid.quotedPrice?.toLocaleString()}</p>
          <p className="text-xs text-surface-400">{bid.estimatedDays}d estimated</p>
        </div>
      </div>
      {bid.notes && <p className="text-xs text-surface-600 bg-surface-50 rounded-lg p-3">{bid.notes}</p>}
      {isCustomer && bid.status === 'pending' && (
        <div className="flex gap-2">
          <button onClick={onAccept} className="btn-primary flex-1 justify-center text-xs py-2">Accept Bid</button>
          <button onClick={onReject} className="btn-secondary text-xs py-2 px-4">Decline</button>
        </div>
      )}
      {bid.status !== 'pending' && (
        <StatusBadge status={bid.status} />
      )}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-40">← Prev</button>
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onChange(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${p === page ? 'bg-brand-500 text-white' : 'text-surface-600 hover:bg-surface-100'}`}>{p}</button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-40">Next →</button>
    </div>
  );
}

// ─── Status Stepper ──────────────────────────────────────────────────────────
const TICKET_JOURNEY = [
  { key: 'open', label: 'Ticket Raised' },
  { key: 'assigned', label: 'Provider Assigned' },
  { key: 'device_in_transit', label: 'Device Picked Up' },
  { key: 'in_repair', label: 'In Repair' },
  { key: 'repair_complete', label: 'Repair Done' },
  { key: 'delivered', label: 'Delivered' },
];

const STATUS_ORDER = ['open','bids_received','assigned','pickup_scheduled','device_in_transit','device_received','in_repair','repair_complete','return_in_transit','delivered','closed'];

export function StatusStepper({ status }) {
  const currentIdx = STATUS_ORDER.indexOf(status);
  const getJourneyStep = (key) => STATUS_ORDER.indexOf(key);

  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-2">
      {TICKET_JOURNEY.map((step, i) => {
        const stepOrder = getJourneyStep(step.key);
        const done = currentIdx >= stepOrder;
        const active = i === TICKET_JOURNEY.findIndex(s => STATUS_ORDER.indexOf(s.key) <= currentIdx && (i === TICKET_JOURNEY.length - 1 || STATUS_ORDER.indexOf(TICKET_JOURNEY[i+1]?.key) > currentIdx));

        return (
          <div key={step.key} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all text-xs font-bold ${
                done ? 'bg-brand-500 text-white' : 'bg-surface-100 text-surface-400'
              }`}>
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap ${done ? 'text-brand-600' : 'text-surface-400'}`}>{step.label}</span>
            </div>
            {i < TICKET_JOURNEY.length - 1 && (
              <div className={`h-0.5 w-10 sm:w-16 mx-1 mb-4 transition-all ${done ? 'bg-brand-400' : 'bg-surface-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
