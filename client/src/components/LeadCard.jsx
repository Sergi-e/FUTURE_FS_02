import { Link } from "react-router-dom";
import ScoreBadge from "./ScoreBadge.jsx";

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
          <p className="truncate font-medium text-slate-900 dark:text-[#E0F7FA]">
            {lead.name}
          </p>
          <p className="truncate text-xs text-slate-500 dark:text-[#E0F7FA]/55">
            {lead.email}
          </p>
        </div>
        <ScoreBadge score={score} />
      </div>
      <p className="mt-2 text-[11px] font-medium text-brand-cyan dark:text-violet-300">
        {String(lead.status || "new").replace(/^\w/, (c) => c.toUpperCase())}
      </p>
      {footer ? (
        <div className="mt-2 border-t border-slate-200/60 pt-2 dark:border-[#2E4A5A]">
          {footer}
        </div>
      ) : null}
    </>
  );

  const className = `block rounded-lg border border-slate-200/80 bg-white/50 p-3 shadow-sm transition will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-[#2E4A5A] dark:bg-[#243B47] dark:focus-visible:ring-offset-[#1A2F3A] ${
    isDragging
      ? "scale-[1.02] cursor-grabbing opacity-90 shadow-xl ring-2 ring-brand-cyan/40"
      : "cursor-grab hover:border-brand-cyan/40 dark:hover:border-brand-cyan/35"
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
