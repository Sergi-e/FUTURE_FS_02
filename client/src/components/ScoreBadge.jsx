const STYLES = {
  hot: "bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/30",
  warm: "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 text-amber-950 shadow-sm shadow-amber-500/25",
  cold: "bg-gradient-to-r from-sky-600 via-cyan-500 to-blue-500 text-white shadow-sm shadow-cyan-500/25",
};

const LABELS = {
  hot: "🔥 Hot",
  warm: "🌤️ Warm",
  cold: "❄️ Cold",
};

export default function ScoreBadge({ score, className = "" }) {
  const key = score === "hot" || score === "warm" ? score : "cold";
  return (
    <span
      title={`Engagement: ${key}`}
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide ring-1 ring-white/30 ${STYLES[key]} ${className}`}
    >
      {LABELS[key]}
    </span>
  );
}
