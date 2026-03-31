import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../utils/api.js";
import { useSocket } from "../context/SocketContext.jsx";

const PIE_COLORS = [
  "#7C3AED",
  "#06B6D4",
  "#F59E0B",
  "#10B981",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

const FUNNEL_STAGES = [
  { status: "new", label: "New" },
  { status: "contacted", label: "Contacted" },
  { status: "qualified", label: "Qualified" },
  { status: "converted", label: "Converted" },
];

function buildSourcePieData(leads) {
  const map = new Map();
  for (const l of leads || []) {
    const key = (l.source && String(l.source).trim()) || "Unknown";
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

function buildFunnelBars(leads) {
  return FUNNEL_STAGES.map(({ status, label }) => ({
    stage: label,
    count: (leads || []).filter((l) => l.status === status).length,
  }));
}

const chartTooltip = {
  contentStyle: {
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,0.4)",
    background: "rgba(255,255,255,0.95)",
  },
  labelStyle: { color: "#0f172a" },
};

export default function AnalyticsChart() {
  const socket = useSocket();
  const [weekly, setWeekly] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [weeklyRes, leadsRes] = await Promise.all([
        api.get("/analytics/weekly"),
        api.get("/leads"),
      ]);
      setWeekly(Array.isArray(weeklyRes.data?.weeks) ? weeklyRes.data.weeks : []);
      setLeads(Array.isArray(leadsRes.data) ? leadsRes.data : []);
    } catch {
      toast.error("Could not load analytics");
      setWeekly([]);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => loadAll();
    socket.on("lead:created", refresh);
    socket.on("lead:updated", refresh);
    socket.on("lead:deleted", refresh);
    return () => {
      socket.off("lead:created", refresh);
      socket.off("lead:updated", refresh);
      socket.off("lead:deleted", refresh);
    };
  }, [socket, loadAll]);

  const pieData = useMemo(() => buildSourcePieData(leads), [leads]);
  const funnelData = useMemo(() => buildFunnelBars(leads), [leads]);

  if (loading) {
    return (
      <div className="glass-card p-8 text-center text-sm text-slate-500 dark:text-white/45">
        Loading analytics…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="glass-card p-5"
      >
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Weekly lead growth
        </h3>
        <p className="text-xs text-slate-500 dark:text-white/50">
          New leads captured each week — trend at a glance
        </p>
        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weekly} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(148,163,184,0.35)"
                className="dark:stroke-white/10"
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-slate-500 dark:text-white/45"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-slate-500 dark:text-white/45"
              />
              <Tooltip {...chartTooltip} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#7C3AED"
                strokeWidth={2}
                dot={{ fill: "#06B6D4", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                animationDuration={400}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.05 }}
          className="glass-card p-5"
        >
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Leads by source
          </h3>
          <p className="text-xs text-slate-500 dark:text-white/50">
            Pie chart — grouped from live lead records
          </p>
          <div className="mt-4 h-64 w-full">
            {pieData.length === 0 ? (
              <p className="flex h-full items-center justify-center text-xs text-slate-500 dark:text-white/40">
                No source data yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={88}
                    paddingAngle={2}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    animationDuration={500}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...chartTooltip} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.1 }}
          className="glass-card p-5"
        >
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Conversion funnel
          </h3>
          <p className="text-xs text-slate-500 dark:text-white/50">
            Bar chart — counts at each pipeline stage
          </p>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={funnelData}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
              >
                <defs>
                  <linearGradient id="funnelGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148,163,184,0.35)"
                  className="dark:stroke-white/10"
                  horizontal={false}
                />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="stage"
                  width={92}
                  tick={{ fontSize: 11 }}
                  className="text-slate-600 dark:text-white/60"
                />
                <Tooltip {...chartTooltip} />
                <Bar
                  dataKey="count"
                  radius={[0, 6, 6, 0]}
                  animationDuration={450}
                  fill="url(#funnelGrad)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
