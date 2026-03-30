import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../utils/api.js";
import { useSocket } from "../context/SocketContext.jsx";
import StatCard from "../components/StatCard.jsx";
import AnalyticsChart from "../components/AnalyticsChart.jsx";

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
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

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1"
      >
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-white/50">
          Snapshot of your pipeline — numbers refresh live from the API + sockets.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          delay={0}
          label="Total leads"
          value={stats.total}
          icon={<UsersIcon />}
        />
        <StatCard
          delay={0.05}
          label="Hot leads"
          value={stats.hot}
          icon={<FireIcon />}
        />
        <StatCard
          delay={0.1}
          label="Converted"
          value={stats.converted}
          icon={<CheckIcon />}
        />
        <StatCard
          delay={0.15}
          label="Follow-ups due"
          value={stats.followUpsDue}
          icon={<CalendarIcon />}
        />
      </div>

      <AnalyticsChart leads={leads} />
    </div>
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
