import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter } from "lucide-react";
import { CustomerLayout } from "../../layouts/AppLayout";
import {
  TicketCard,
  EmptyState,
  CardSkeleton,
  Pagination,
} from "../../components/ui";
import api from "../../services/api";

const TABS = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "active", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const ACTIVE_STATUSES = [
  "assigned",
  "pickup_scheduled",
  "device_in_transit",
  "device_received",
  "in_repair",
  "repair_complete",
  "return_in_transit",
];

export function MyTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  useEffect(() => {
    api
      .get("/tickets")
      .then((res) => {
        // api interceptor unwraps axios response.data, so res = ApiResponse { data, message }
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.tickets || res.data?.data?.tickets || [];
        setTickets(list);
      })
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tickets.filter((t) => {
    const matchTab =
      tab === "all"
        ? true
        : tab === "open"
          ? ["open", "bids_received"].includes(t.status)
          : tab === "active"
            ? ACTIVE_STATUSES.includes(t.status)
            : tab === "completed"
              ? ["delivered", "closed"].includes(t.status)
              : t.status === "cancelled";
    const matchSearch =
      !search ||
      t.ticketNo.toLowerCase().includes(search.toLowerCase()) ||
      t.issueTitle.toLowerCase().includes(search.toLowerCase()) ||
      t.deviceModel.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const tabCount = (key) => {
    if (key === "all") return tickets.length;
    if (key === "open")
      return tickets.filter((t) => ["open", "bids_received"].includes(t.status))
        .length;
    if (key === "active")
      return tickets.filter((t) => ACTIVE_STATUSES.includes(t.status)).length;
    if (key === "completed")
      return tickets.filter((t) => ["delivered", "closed"].includes(t.status))
        .length;
    return tickets.filter((t) => t.status === "cancelled").length;
  };

  return (
    <CustomerLayout
      title="My Tickets"
      actions={
        <button
          onClick={() => navigate("/customer/new")}
          className="btn-primary"
        >
          <Plus size={16} /> New Ticket
        </button>
      }
    >
      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.key
                  ? "bg-brand-500 text-white"
                  : "text-surface-500 hover:bg-surface-100"
              }`}
            >
              {t.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-brand-400 text-white" : "bg-surface-200 text-surface-600"}`}
              >
                {tabCount(t.key)}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by ticket no, issue, or device..."
            className="input pl-9 py-2 text-sm"
          />
        </div>
      </div>

      {/* Ticket grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <EmptyState
          title={search ? "No tickets match your search" : "No tickets yet"}
          description={
            search
              ? "Try a different search term."
              : "Raise your first repair ticket to get started."
          }
          action={
            !search && (
              <button
                onClick={() => navigate("/customer/new")}
                className="btn-primary"
              >
                <Plus size={16} />
                Raise a Ticket
              </button>
            )
          }
        />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            {paginated.map((t) => (
              <TicketCard
                key={t._id}
                ticket={t}
                onClick={() => navigate(`/customer/tickets/${t._id}`)}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </CustomerLayout>
  );
}
