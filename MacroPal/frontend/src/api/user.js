/*
  helper for user-related api stuff
  right now mainly for reading and updating daily macro goals
*/


import { API_BASE, authHeaders } from "./base";

/*
  grab the user’s current goals from backend

  backend returns { goals: { cal, protein, carbs, fat } }
  we default to zeros if something is missing just to be safe
*/
export async function getGoals() {
    const res = await fetch(`${API_BASE}/api/user/goals`, {
        headers: authHeaders(),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Failed to fetch goals");
    return body.goals || { cal: 0, protein: 0, carbs: 0, fat: 0 };
}

/*
  update the user’s goals on the backend

  expects a patch object like { cal: 2000, protein: 150 }
  backend returns the latest goals if successful
*/
export async function patchGoals(patch) {
    const res = await fetch(`${API_BASE}/api/user/goals`, {
        method: "PATCH",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify(patch),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Failed to update goals");
    return body.goals || { cal: 0, protein: 0, carbs: 0, fat: 0 };
}
