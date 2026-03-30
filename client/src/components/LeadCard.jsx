import { Link } from "react-router-dom";

const SCORE_LABEL = {
  hot: "Hot 🔥",
  warm: "Warm 🌤️",
  cold: "Cold ❄️",
};

const SCORE_STYLE = {
  hot: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
  warm: "bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/30",
  cold: "bg-sky-500/15 text-sky-800 dark:text-sky-200 border-sky-500/30",
};

/**
 * Shared card UI for kanban + links. Drag props come from @dnd-kit when used on the board.
 */
export default function LeadCard({
  lead,
  dragRef,
  dragAttributes,
  dragListeners,
  isDragging,
  style,
  asLink = true,
  footer = null,
}) {
  const score = lead.score || "cold";
  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900 dark:text-white">
            {lead.name}
          </p>
          <p className="truncate text-xs text-slate-500 dark:text-white/55">
            {lead.email}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${SCORE_STYLE[score] || SCORE_STYLE.cold}`}
        >
          {SCORE_LABEL[score] || SCORE_LABEL.cold}
        </span>
      </div>
      <p className="mt-2 text-[11px] font-medium text-brand-violet dark:text-violet-300">
        {String(lead.status || "new").replace(/^\w/, (c) => c.toUpperCase())}
      </p>
      {footer ? <div className="mt-2 border-t border-slate-200/60 pt-2 dark:border-white/10">{footer}</div> : null}
    </>
  );

  const className = `block rounded-lg border border-slate-200/80 bg-white/50 p-3 shadow-sm transition dark:border-white/10 dark:bg-white/5 ${
    isDragging ? "opacity-60 ring-2 ring-brand-violet/50" : "hover:border-brand-violet/40 dark:hover:border-brand-violet/35"
  }`;

  if (asLink && !dragListeners) {
    return (
      <Link to={`/leads/${lead._id}`} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <div
      ref={dragRef}
      style={style}
      className={className}
      {...(dragAttributes || {})}
      {...(dragListeners || {})}
    >
      {inner}
    </div>
  );
}
