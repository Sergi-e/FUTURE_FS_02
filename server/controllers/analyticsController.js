import Lead from "../models/Lead.js";

function startOfWeekMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day + 6) % 7;
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Aggregates new leads per calendar week so the dashboard chart does not fake data on the client. */
export async function getWeeklyLeadGrowth(_req, res) {
  try {
    const now = new Date();
    const thisMonday = startOfWeekMonday(now);
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const buckets = [];

    for (let i = 7; i >= 0; i -= 1) {
      const weekStart = new Date(thisMonday.getTime() - i * weekMs);
      const weekEnd = new Date(weekStart.getTime() + weekMs);
      buckets.push({
        weekStart,
        weekEnd,
        label: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        count: 0,
      });
    }

    const leads = await Lead.find({}).select("createdAt").lean();
    for (const lead of leads) {
      const created = lead.createdAt ? new Date(lead.createdAt) : null;
      if (!created || Number.isNaN(created.getTime())) continue;
      const bucket = buckets.find(
        (b) => created >= b.weekStart && created < b.weekEnd
      );
      if (bucket) bucket.count += 1;
    }

    res.json({
      weeks: buckets.map(({ label, count }) => ({ label, count })),
    });
  } catch (err) {
    console.error("getWeeklyLeadGrowth:", err);
    res.status(500).json({ message: "Could not load analytics" });
  }
}
