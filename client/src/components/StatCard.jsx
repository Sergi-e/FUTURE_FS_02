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
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-[#E0F7FA]/50">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900 dark:text-[#E0F7FA]">
            {value}
          </p>
        </div>
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-cyan/15 text-brand-cyan dark:bg-brand-cyan/20 dark:text-violet-300"
          aria-hidden
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
