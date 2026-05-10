import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Ticket,
  Clock,
  CheckCircle,
  Star,
  Plus,
  ArrowRight,
  Wrench,
  TrendingUp,
  Bell,
} from "lucide-react";
import { CustomerLayout } from "../../layouts/AppLayout";
import {
  StatCard,
  TicketCard,
  CardSkeleton,
  EmptyState,
  StatusBadge,
  Avatar,
} from "../../components/ui";
import api from "../../services/api";
import { format, formatDistanceToNow } from "date-fns";

const ACTIVITY = [];

export function CustomerDashboard() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/tickets")
      .then((res) => {
        const list = res.data?.data?.tickets || res.data?.tickets || [];
        setTickets(list);
      })
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  const active = tickets.filter(
    (t) => !["delivered", "closed", "cancelled"].includes(t.status),
  );
  const pending = tickets.filter((t) => t.status === "bids_received").length;
  const completed = tickets.filter((t) =>
    ["delivered", "closed"].includes(t.status),
  ).length;
  const pendingReview = tickets.filter((t) => t.status === "delivered").length;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <CustomerLayout
      title="Dashboard"
      actions={
        <button
          onClick={() => navigate("/customer/new")}
          className="btn-primary"
        >
          <Plus size={16} /> Raise Ticket
        </button>
      }
    >
      {/* Greeting */}
      <div className="mb-6">
        <h2 className="text-xl font-display font-semibold text-surface-900">
          {greeting}, {user?.name?.split(" ")[0]} 👋
        </h2>
        <p className="text-sm text-surface-500 mt-0.5">
          Here's what's happening with your devices
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Ticket}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          label="Active Tickets"
          value={active.length}
        />
        <StatCard
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          label="Awaiting Bid"
          value={pending}
        />
        <StatCard
          icon={CheckCircle}
          iconBg="bg-green-50"
          iconColor="text-green-500"
          label="Completed"
          value={completed}
        />
        <StatCard
          icon={Star}
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
          label="Pending Reviews"
          value={pendingReview}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Active tickets */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Active Tickets</h3>
            <button
              onClick={() => navigate("/customer/tickets")}
              className="text-xs text-brand-600 font-medium hover:text-brand-700 flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : active.length === 0 ? (
            <EmptyState
              icon={Ticket}
              title="No active tickets"
              description="Raise a ticket to get repair quotes from providers near you."
              action={
                <button
                  onClick={() => navigate("/customer/new")}
                  className="btn-primary"
                >
                  <Plus size={16} />
                  Raise your first ticket
                </button>
              }
            />
          ) : (
            <div className="flex flex-col gap-3">
              {active.slice(0, 4).map((t) => (
                <TicketCard
                  key={t._id}
                  ticket={t}
                  onClick={() => navigate(`/customer/tickets/${t._id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Recent activity */}
          <div>
            <h3 className="section-title mb-4">Recent Activity</h3>
            <div className="card p-0 overflow-hidden">
              {ACTIVITY.map((a, i) => (
                <div
                  key={a.id}
                  className={`flex items-start gap-3 p-3.5 ${i < ACTIVITY.length - 1 ? "border-b border-surface-100" : ""}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${a.type === "bid" ? "bg-blue-50" : "bg-green-50"}`}
                  >
                    {a.type === "bid" ? (
                      <Bell size={13} className="text-blue-500" />
                    ) : (
                      <CheckCircle size={13} className="text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-surface-600">
                      {a.text}{" "}
                      <span className="font-mono font-medium text-brand-600">
                        {a.ticket}
                      </span>
                    </p>
                    <p className="text-[10px] text-surface-400 mt-0.5">
                      {a.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending reviews */}
          {pendingReview > 0 && (
            <div>
              <h3 className="section-title mb-3">Leave a Review</h3>
              <div className="card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <Star size={18} className="text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-surface-800">
                    {pendingReview} repair{pendingReview > 1 ? "s" : ""}{" "}
                    awaiting review
                  </p>
                  <p className="text-xs text-surface-400">
                    Help others by sharing your experience
                  </p>
                </div>
                <ArrowRight size={16} className="text-surface-300" />
              </div>
            </div>
          )}

          {/* Quick tip */}
          <div className="card p-4 bg-brand-50 border-brand-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={16} className="text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-800 mb-0.5">
                  Pro tip
                </p>
                <p className="text-xs text-brand-600">
                  Add photos to your ticket to get more accurate quotes from
                  providers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
