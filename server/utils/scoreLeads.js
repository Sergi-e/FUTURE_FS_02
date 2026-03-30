/**
 * Simple recency tiers for the pipeline view.
 * Hot = someone reached out within 3 days, warm up to a week, cold after that (or never touched).
 */
export function computeLeadScore(lastContactedAt) {
  if (!lastContactedAt) return "cold";

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysSince = (Date.now() - new Date(lastContactedAt).getTime()) / msPerDay;

  if (daysSince <= 3) return "hot";
  if (daysSince <= 7) return "warm";
  return "cold";
}
