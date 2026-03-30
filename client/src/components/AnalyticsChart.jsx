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

/**
 * Weekly new-lead counts derived entirely from `createdAt` on the client.
 * Good enough for the dashboard until we add a dedicated analytics endpoint.
 */
export default function AnalyticsChart({ leads }) {
  const buckets = buildWeeklyBuckets(leads);

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
        New leads created per week (last 8 weeks)
      </p>
      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={buckets} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.35)" className="dark:stroke-white/10" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "currentColor" }} className="text-slate-500 dark:text-white/45" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "currentColor" }} className="text-slate-500 dark:text-white/45" />
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
      </div>
    </motion.div>
  );
}

function startOfWeekMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day + 6) % 7;
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function buildWeeklyBuckets(leads) {
  const now = new Date();
  const thisMonday = startOfWeekMonday(now);
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const buckets = [];

  for (let i = 7; i >= 0; i -= 1) {
    const weekStart = new Date(thisMonday.getTime() - i * weekMs);
    const weekEnd = new Date(weekStart.getTime() + weekMs);
    buckets.push({
      label: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
      weekStart,
      weekEnd,
      count: 0,
    });
  }

  for (const lead of leads || []) {
    const created = lead.createdAt ? new Date(lead.createdAt) : null;
    if (!created || Number.isNaN(created.getTime())) continue;
    const bucket = buckets.find(
      (b) => created >= b.weekStart && created < b.weekEnd
    );
    if (bucket) bucket.count += 1;
  }

  return buckets.map(({ label, count }) => ({ label, count }));
}
