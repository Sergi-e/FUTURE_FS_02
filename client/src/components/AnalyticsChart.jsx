import { useCallback, useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../utils/api.js";
import { useSocket } from "../context/SocketContext.jsx";

export default function AnalyticsChart() {
  const socket = useSocket();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/analytics/weekly");
      setRows(Array.isArray(data.weeks) ? data.weeks : []);
    } catch {
      toast.error("Could not load weekly analytics");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => load();
    socket.on("lead:created", refresh);
    socket.on("lead:deleted", refresh);
    return () => {
      socket.off("lead:created", refresh);
      socket.off("lead:deleted", refresh);
    };
  }, [socket, load]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="glass-card p-5"
    >
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
        Weekly lead growth
      </h3>
      <p className="text-xs text-slate-500 dark:text-white/50">
        New leads per week from <code className="text-brand-cyan">GET /api/analytics/weekly</code>
      </p>
      <div className="mt-4 h-64 w-full">
        {loading ? (
          <p className="py-20 text-center text-sm text-slate-500 dark:text-white/45">
            Loading chart…
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
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
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid rgba(148,163,184,0.4)",
                  background: "rgba(255,255,255,0.95)",
                }}
                labelStyle={{ color: "#0f172a" }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#7C3AED"
                strokeWidth={2}
                dot={{ fill: "#06B6D4", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
