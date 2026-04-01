/** Normalizes email for lookups and storage (lowercase + trim). */
export function normalizeEmail(email) {
  return String(email ?? "").toLowerCase().trim();
}
