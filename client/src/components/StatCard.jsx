import { motion } from "framer-motion";

export default function StatCard({ icon, value, label, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      className="glass-card p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-white/50">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900 dark:text-white">
            {value}
          </p>
        </div>
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-violet/15 text-brand-violet dark:bg-brand-violet/20 dark:text-violet-300"
          aria-hidden
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
