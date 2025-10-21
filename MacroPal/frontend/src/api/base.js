/*
  central api base + helper for including auth headers

  api base:
    uses vite env var if set, otherwise defaults to localhost

  authHeaders:
    returns standard json headers plus the x-user-id we store in localStorage
    extra headers can be merged in if needed
*/

export const API_BASE =
    import.meta.env.VITE_API_BASE || "http://localhost:5000";

export function authHeaders(extra = {}) {
    return {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "x-user-id": localStorage.getItem("mp_user_id") || "",
        ...extra,
    };
}
