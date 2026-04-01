export function normalizeClientEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}
