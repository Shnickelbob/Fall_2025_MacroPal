/*
  small helper api for the daily log

  handles the fetch call to get today's log
  so the page code can stay cleaner and not repeat urls all over
*/

import { API_BASE, authHeaders } from "./base";

/*
  calls the backend to grab today's log

  throws a regular error if the response is not ok
  so whoever calls this can catch and show a message
*/
export async function fetchToday() {
  const uid = localStorage.getItem("mp_user_id") || "";
  const res = await fetch(`${API_BASE}/api/log/today`, {
    headers: {
      ...authHeaders(),
      "x-user-id": uid,            // include header for backend auth
      Accept: "application/json",
    },
    credentials: "include",         // supports session too
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET /api/log/today failed: ${res.status} ${text}`);
  }

  return res.json();
}
