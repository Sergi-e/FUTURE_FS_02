import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api.js";
import { useSocket } from "../context/SocketContext.jsx";
import StatCard from "../components/StatCard.jsx";
import AnalyticsChart from "../components/AnalyticsChart.jsx";
import Page from "../components/Page.jsx";

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function followUpLabel(iso) {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return "";
  return dt < startOfToday() ? "Overdue" : "Due today";
}

function DashboardEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/90 bg-gradient-to-b from-white/50 to-slate-100/30 py-16 text-center dark:border-[#2E4A5A] dark:from-white/5 dark:to-transparent">
      <div
        className="mb-5 flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-cyan/25 via-white/40 to-brand-cyan/25 text-5xl shadow-inner dark:from-brand-cyan/20 dark:via-white/5 dark:to-brand-cyan/15"
        aria-hidden
      >
        📊
      </div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-[#E0F7FA]">
        Your mission control is quiet
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-[#E0F7FA]/55">
        No leads yet — add one with{" "}
        <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-xs dark:border-[#2E4A5A] dark:bg-[#243B47]">
          Ctrl+K
        </kbd>{" "}
        or <span className="font-medium text-brand-cyan">Add lead</span> in the header. Stats
        and charts will light up as soon as data lands.
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const socket = useSocket();
  const [leads, setLeads] = useState([]);

  const loadLeads = useCallback(async () => {
    try {
      const { data } = await api.get("/leads");
      setLeads(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Could not load leads");
    }
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  useEffect(() => {
    const onRefresh = () => loadLeads();
    window.addEventListener("leadrift:leads-changed", onRefresh);
    return () => window.removeEventListener("leadrift:leads-changed", onRefresh);
  }, [loadLeads]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => loadLeads();
    socket.on("lead:created", refresh);
    socket.on("lead:updated", refresh);
    socket.on("lead:deleted", refresh);
    return () => {
      socket.off("lead:created", refresh);
      socket.off("lead:updated", refresh);
      socket.off("lead:deleted", refresh);
    };
  }, [socket, loadLeads]);

  const stats = useMemo(() => {
    const total = leads.length;
    const hot = leads.filter((l) => l.score === "hot").length;
    const converted = leads.filter((l) => l.status === "converted").length;
    const dueCutoff = endOfToday();
    const followUpsDue = leads.filter((l) => {
      if (!l.followUpDate) return false;
      const dt = new Date(l.followUpDate);
      return !Number.isNaN(dt.getTime()) && dt <= dueCutoff;
    }).length;
    return { total, hot, converted, followUpsDue };
  }, [leads]);

  const urgentFollowUps = useMemo(() => {
    const dueCutoff = endOfToday();
    return leads
      .filter((l) => {
        if (!l.followUpDate) return false;
        const dt = new Date(l.followUpDate);
        return !Number.isNaN(dt.getTime()) && dt <= dueCutoff;
      })
      .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate));
  }, [leads]);

  return (
    <Page className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-[#E0F7FA]">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-[#E0F7FA]/50">
          Snapshot of your pipeline — stats and charts update in real time as leads change.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard delay={0} label="Total leads" value={stats.total} icon={<UsersIcon />} />
        <StatCard delay={0.05} label="Hot leads" value={stats.hot} icon={<FireIcon />} />
        <StatCard delay={0.1} label="Converted" value={stats.converted} icon={<CheckIcon />} />
        <StatCard
          delay={0.15}
          label="Follow-ups due"
          value={stats.followUpsDue}
          icon={<CalendarIcon />}
        />
      </div>

      {urgentFollowUps.length > 0 ? (
        <section className="glass-card border-red-500/40 bg-red-500/[0.07] p-4 dark:border-red-500/35 dark:bg-red-500/10">
          <h2 className="text-sm font-semibold text-red-700 dark:text-red-300">
            Follow-up alerts — today or overdue
          </h2>
          <p className="text-xs text-red-600/90 dark:text-red-200/70">
            These leads need attention (highlighted in red).
          </p>
          <ul className="mt-3 space-y-2">
            {urgentFollowUps.map((l) => (
              <li key={l._id}>
                <Link
                  to={`/leads/${l._id}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm transition hover:bg-red-500/15 dark:border-red-400/30 dark:bg-red-500/15 dark:hover:bg-red-500/20"
                >
                  <span className="font-medium text-red-900 dark:text-red-100">{l.name}</span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">
                    {followUpLabel(l.followUpDate)} ·{" "}
                    {new Date(l.followUpDate).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {leads.length === 0 ? (
        <DashboardEmptyState />
      ) : (
        <AnalyticsChart />
      )}
    </Page>
  );
}

function UsersIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function FireIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}
