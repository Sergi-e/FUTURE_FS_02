import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../utils/api.js";
import { useSocket } from "../context/SocketContext.jsx";

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ActivityFeed() {
  const socket = useSocket();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/activities");
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) toast.error("Could not load activity feed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onNew = (payload) => {
      setItems((prev) => [payload, ...prev].slice(0, 80));
    };

    socket.on("activity:new", onNew);
    return () => {
      socket.off("activity:new", onNew);
    };
  }, [socket]);

  return (
    <aside
      className="hidden w-[300px] shrink-0 border-l border-slate-200/60 bg-white/30 backdrop-blur-md dark:border-[#2E4A5A] dark:bg-[#243B47] lg:flex lg:flex-col"
      aria-label="Live activity"
    >
      <div className="border-b border-slate-200/60 px-4 py-3 dark:border-[#2E4A5A]">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-[#E0F7FA]">
          Live activity
        </h2>
        <p className="text-xs text-slate-500 dark:text-[#E0F7FA]/50">
          Live updates as leads and notes change
        </p>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {loading ? (
          <p className="text-xs text-slate-500 dark:text-[#E0F7FA]/45">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-[#E0F7FA]/45">
            No events yet — create a lead or log an activity.
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {items.map((a, idx) => (
              <motion.div
                key={a._id ? String(a._id) : `act-${idx}-${a.createdAt}`}
                layout
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-lg border border-slate-200/70 bg-white/60 p-2.5 text-xs shadow-sm dark:border-[#2E4A5A] dark:bg-[#243B47]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-brand-cyan dark:text-violet-300">
                    {a.type}
                  </span>
                  <span className="shrink-0 text-[10px] text-slate-400 dark:text-[#E0F7FA]/40">
                    {formatTime(a.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-slate-700 dark:text-[#E0F7FA]/80">{a.message}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </aside>
  );
}
