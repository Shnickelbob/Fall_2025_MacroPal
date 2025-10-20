/**
 * Helpers for fetching daily log + goals from backend.
 * Returns: { dateKey, entries, totals, goals, remaining }
 */
export async function fetchToday() {
  const res = await fetch("/api/log/today", { credentials: "include" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET /api/log/today failed: ${res.status} ${text}`);
  }
  return res.json();
}
