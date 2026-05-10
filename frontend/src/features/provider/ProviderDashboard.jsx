import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  DollarSign,
  Star,
  Clock,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { ProviderLayout } from "../../layouts/AppLayout";
import {
  StatCard,
  Card,
  StatusBadge,
  UrgencyBadge,
  DeviceIcon,
  Avatar,
  Skeleton,
} from "../../components/ui";
import api from "../../services/api";

const REVENUE_DATA = [0, 0, 0, 0, 0, 0, 0];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function MiniBarChart({ data, days }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((v, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full rounded-t-sm bg-brand-100 relative overflow-hidden"
            style={{ height: "64px" }}
          >
            <div
              className="absolute bottom-0 left-0 right-0 bg-brand-500 rounded-t-sm transition-all"
              style={{ height: `${(v / max) * 100}%` }}
            />
          </div>
          <span className="text-[9px] text-surface-400">{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

export function ProviderDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [marketplace, setMarketplace] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/tickets"), // This will now get provider's assigned tickets
      api.get("/tickets/marketplace?limit=3"),
    ])
      .then(([jobsRes, marketRes]) => {
        setJobs(jobsRes.data?.data || jobsRes.data || []);
        setMarketplace(
          marketRes.data?.tickets || marketRes.data?.data?.tickets || [],
        );
      })
      .catch((err) => {
        console.error("Error fetching dashboard data:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeCount = jobs.filter(
    (j) => !["delivered", "closed", "cancelled"].includes(j.status),
  ).length;

  return (
    <ProviderLayout
      title="Dashboard"
      actions={
        <button
          onClick={() => navigate("/provider/marketplace")}
          className="btn-primary"
        >
          Browse Marketplace
        </button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Briefcase}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          label="Active Jobs"
          value={activeCount}
        />
        <StatCard
          icon={DollarSign}
          iconBg="bg-green-50"
          iconColor="text-green-500"
          label="This Month"
          value="₹0"
        />
        <StatCard
          icon={Star}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          label="Rating"
          value="0.0"
          sub="No reviews yet"
        />
        <StatCard
          icon={CheckCircle}
          iconBg="bg-green-50"
          iconColor="text-green-500"
          label="Jobs Completed"
          value={jobs.filter((j) => j.status === "delivered").length}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Active jobs */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">Active Jobs</h3>
              <button
                onClick={() => navigate("/provider/jobs")}
                className="text-xs text-brand-600 font-medium flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 bg-surface-100 animate-pulse rounded-xl"
                  />
                ))
              ) : jobs.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-sm text-surface-500">
                    No active jobs. Bid on tickets in the marketplace to get
                    started.
                  </p>
                </div>
              ) : (
                jobs.slice(0, 5).map((job) => (
                  <Card
                    key={job._id}
                    className="flex items-center gap-4 p-4 hover:shadow-card transition-shadow cursor-pointer"
                    padding={false}
                    onClick={() => navigate(`/provider/jobs/${job._id}`)}
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <DeviceIcon
                        type={job.deviceType}
                        className="h-4 w-4 text-brand-600"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-surface-900 truncate">
                        {job.issueTitle}
                      </p>
                      <p className="text-xs text-surface-400">
                        {job.deviceBrand} {job.deviceModel} ·{" "}
                        <span className="font-mono">{job.ticketNo}</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <StatusBadge status={job.status} />
                      <span className="text-xs font-semibold text-surface-700">
                        ₹{job.finalPrice || "—"}
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Revenue chart */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="section-title">Weekly Revenue</h3>
                <p className="text-xs text-surface-400">Last 7 days</p>
              </div>
              <span className="text-lg font-bold text-surface-900">₹0</span>
            </div>
            <MiniBarChart data={REVENUE_DATA} days={DAYS} />
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Marketplace preview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">New Tickets</h3>
              <button
                onClick={() => navigate("/provider/marketplace")}
                className="text-xs text-brand-600 font-medium flex items-center gap-1"
              >
                Marketplace <ArrowRight size={12} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 bg-surface-100 animate-pulse rounded-xl"
                  />
                ))
              ) : marketplace.length === 0 ? (
                <div className="card p-4 text-center">
                  <p className="text-xs text-surface-500">
                    No new tickets in your area.
                  </p>
                </div>
              ) : (
                marketplace.map((t) => (
                  <Card
                    key={t._id}
                    className="p-3.5 hover:shadow-card transition-shadow cursor-pointer"
                    padding={false}
                    onClick={() => navigate("/provider/marketplace")}
                  >
                    <div className="flex items-start gap-2.5 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-surface-100 flex items-center justify-center flex-shrink-0">
                        <DeviceIcon
                          type={t.deviceType}
                          className="h-3.5 w-3.5 text-surface-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-surface-900 truncate">
                          {t.issueTitle}
                        </p>
                        <p className="text-[10px] text-surface-400">
                          {t.deviceBrand} {t.deviceModel}
                        </p>
                      </div>
                      <UrgencyBadge urgency={t.urgency} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-surface-400">
                        Budget: ₹{t.budgetMin}–{t.budgetMax}
                      </span>
                      <button className="text-[10px] text-brand-600 font-medium hover:text-brand-700">
                        Bid →
                      </button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Performance */}
          <Card>
            <h3 className="section-title mb-4">Performance</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: "Response Rate", value: 0, color: "bg-green-500" },
                { label: "Completion Rate", value: 0, color: "bg-brand-500" },
                {
                  label: "Customer Satisfaction",
                  value: 0,
                  color: "bg-purple-500",
                },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-surface-500">{m.label}</span>
                    <span className="text-xs font-semibold text-surface-700">
                      {m.value}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${m.color} rounded-full`}
                      style={{ width: `${m.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </ProviderLayout>
  );
}
