import { useState, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import { ProviderLayout } from "../../layouts/AppLayout";
import {
  DeviceIcon,
  UrgencyBadge,
  EmptyState,
  Pagination,
  Card,
  LoadingSpinner,
} from "../../components/ui";
import api from "../../services/api";

function BidModal({ ticket, onClose }) {
  const [form, setForm] = useState({
    quotedPrice: "",
    estimatedDays: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await api.post(`/tickets/${ticket._id}/bids`, {
        quotedPrice: Number(form.quotedPrice),
        estimatedDays: Number(form.estimatedDays),
        notes: form.notes,
      });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit bid");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative card p-6 w-full max-w-md">
        {done ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl text-green-600">✓</span>
            </div>
            <h3 className="text-base font-semibold text-surface-900 mb-1">
              Bid Submitted!
            </h3>
            <p className="text-sm text-surface-500 mb-4">
              The customer will be notified of your bid.
            </p>
            <button onClick={onClose} className="btn-primary">
              Done
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-base font-semibold text-surface-900 mb-1">
              Submit a Bid
            </h3>
            <p className="text-xs text-surface-500 mb-4">
              for {ticket.issueTitle}
            </p>
            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Quoted Price (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={form.quotedPrice}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, quotedPrice: e.target.value }))
                      }
                      className="input pl-7"
                      placeholder="2500"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Est. Days *</label>
                  <input
                    type="number"
                    value={form.estimatedDays}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, estimatedDays: e.target.value }))
                    }
                    className="input"
                    placeholder="2"
                    min="1"
                  />
                </div>
              </div>
              <div>
                <label className="label">Notes for customer</label>
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  className="input h-24 resize-none"
                  placeholder="Describe your approach, parts used, warranty offered..."
                />
              </div>
              <div className="flex gap-2">
                <button onClick={onClose} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  onClick={submit}
                  disabled={
                    !form.quotedPrice || !form.estimatedDays || submitting
                  }
                  className="btn-primary flex-1 justify-center"
                >
                  {submitting ? <LoadingSpinner size="sm" /> : "Submit Bid"}
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
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [bidding, setBidding] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTickets();
  }, [page, deviceFilter, urgencyFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 12,
        ...(deviceFilter !== "all" && { deviceType: deviceFilter }),
        ...(urgencyFilter !== "all" && { urgency: urgencyFilter }),
        ...(search && { search }),
      });
      const res = await api.get(`/tickets/marketplace?${params.toString()}`);
      setTickets(res.data?.tickets || res.data?.data?.tickets || []);
      setTotalPages(res.data?.totalPages || res.data?.data?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching marketplace:", err);
    } finally {
      setLoading(false);
    }
  };

  const timeAgo = (d) => {
    const diff = Date.now() - new Date(d).getTime();
    if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
    return `${Math.round(diff / 86400000)}d ago`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTickets();
  };

  return (
    <ProviderLayout title="Marketplace">
      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by issue..."
            className="input pl-9 text-sm"
          />
        </form>
        <select
          value={deviceFilter}
          onChange={(e) => {
            setDeviceFilter(e.target.value);
            setPage(1);
          }}
          className="input w-auto text-sm"
        >
          <option value="all">All Devices</option>
          <option value="mobile">Mobile</option>
          <option value="laptop">Laptop</option>
          <option value="pc">Desktop PC</option>
          <option value="console">Console</option>
        </select>
        <select
          value={urgencyFilter}
          onChange={(e) => {
            setUrgencyFilter(e.target.value);
            setPage(1);
          }}
          className="input w-auto text-sm"
        >
          <option value="all">All Urgency</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 bg-surface-100 animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          title="No tickets found"
          description="Try adjusting your filters or check back later."
        />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {tickets.map((ticket) => (
              <Card
                key={ticket._id}
                className="flex flex-col gap-3 p-5"
                padding={false}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0">
                      <DeviceIcon
                        type={ticket.deviceType}
                        className="h-4 w-4 text-surface-500"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-surface-400">
                        {ticket.ticketNo}
                      </p>
                      <p className="text-xs text-surface-400">
                        {ticket.deviceBrand} {ticket.deviceModel}
                      </p>
                    </div>
                  </div>
                  <UrgencyBadge urgency={ticket.urgency} />
                </div>

                {/* Title + desc */}
                <div>
                  <p className="text-sm font-semibold text-surface-900 mb-1">
                    {ticket.issueTitle}
                  </p>
                  <p className="text-xs text-surface-500 line-clamp-2">
                    {ticket.issueDescription}
                  </p>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-surface-400">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {ticket.pickupAddress?.city || "Unknown Location"}
                  </span>
                  <span>·</span>
                  <span>{timeAgo(ticket.createdAt)}</span>
                </div>

                {/* Budget + CTA */}
                <div className="flex items-center justify-between pt-2 border-t border-surface-100">
                  <div>
                    <p className="text-[10px] text-surface-400">Budget</p>
                    <p className="text-sm font-semibold text-surface-800">
                      {ticket.budgetMin
                        ? `₹${ticket.budgetMin.toLocaleString()}`
                        : "—"}{" "}
                      –{" "}
                      {ticket.budgetMax
                        ? `₹${ticket.budgetMax.toLocaleString()}`
                        : "—"}
                    </p>
                  </div>
                  <button
                    onClick={() => setBidding(ticket)}
                    className="btn-primary py-1.5 text-xs"
                  >
                    Place Bid
                  </button>
                </div>
              </Card>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      {bidding && (
        <BidModal ticket={bidding} onClose={() => setBidding(null)} />
      )}
    </ProviderLayout>
  );
}
