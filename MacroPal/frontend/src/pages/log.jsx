/*
  daily log page (frontend)

  what this screen does:
  - fetches today's logged items for the current user from the backend
  - shows a quick summary of totals vs goals
  - lets the user remove a single logged entry
  - has quick links back to home and search

  api shape used here:
    GET /api/log/today  -> returns { dateKey, entries, totals, goals, remaining }
    DELETE /api/log/:id -> removes one log entry by its _id

  notes:
  - keeps optimistic ui on delete so the page feels snappy
  - reads user id and screen name from localStorage keys
  - totals are recomputed locally when items change
 
  @author Brian Schaeffer
  @version October 19, 2025
 */

import { useEffect, useState } from "react";
import "./log.css";
import { Link } from "react-router-dom";


/*
  top level component
  holds state for loading, items, totals, goals, and simple error text
  everything on the page flows from these buckets
*/
export default function DailyLog() {
    /* state for data and page chrome */
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]); // today’s LogEntry[] from backend
    const [totals, setTotals] = useState({ cal: 0, protein: 0, fat: 0, carbs: 0 });
    const [goals, setGoals] = useState({ cal: 0, protein: 0, fat: 0, carbs: 0 }); // always present
    const [screenName, setScreenName] = useState("User");
    const [error, setError] = useState("");

    /*
      initial load
      grabs today's log using the new route and normalizes numbers to be safe
      also pulls the saved screen name so the header feels personal
    */
    useEffect(() => {
        (async () => {
            try {
                setError("");

                const res = await fetch("http://localhost:5000/api/log/today", {
                    headers: {
                        "x-user-id": localStorage.getItem("mp_user_id") || ""
                    }
                });

                if (!res.ok) throw new Error("Failed to load log");
                const data = await res.json();

                // new payload: entries/totals/goals
                const safeTotals = {
                    cal: Number(data?.totals?.cal) || 0,
                    protein: Number(data?.totals?.protein) || 0,
                    fat: Number(data?.totals?.fat) || 0,
                    carbs: Number(data?.totals?.carbs) || 0,
                };
                const safeGoals = {
                    cal: Number(data?.goals?.cal) || 0,
                    protein: Number(data?.goals?.protein) || 0,
                    fat: Number(data?.goals?.fat) || 0,
                    carbs: Number(data?.goals?.carbs) || 0,
                };

                setItems(Array.isArray(data.entries) ? data.entries : []);
                setTotals(safeTotals);
                setGoals(safeGoals);

                // show their screen name from login (saved in localStorage)
                setScreenName(localStorage.getItem("mp_screen_name") || "User");
            } catch (e) {
                console.error(e);
                setError("Failed to load log.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    /*
      remove a single logged entry by its entry id
      does optimistic remove first, then calls the api
      if the api fails, rolls back to previous state
    */
    async function removeOne(entryId) {
        const prev = items;
        const next = prev.filter(x => x._id !== entryId);

        // optimistic ui: yank it locally and recompute totals
        setItems(next);
        setTotals(calcTotalsNew(next));

        try {
            const res = await fetch(`http://localhost:5000/api/log/${entryId}`, {
                method: "DELETE",
                headers: {
                    "x-user-id": localStorage.getItem("mp_user_id") || ""
                }
            });
            // joseph’s route returns 204 no content on success
            if (!res.ok && res.status !== 204) throw new Error("Delete failed");
        } catch (e) {
            console.error(e);
            // backend refused? roll it back
            setItems(prev);
            setTotals(calcTotalsNew(prev));
            alert("Failed to remove item.");
        }
    }

    return (
        <div className="log-container">
            {/* page header section with friendly intro */}
            <div className="intro">
                <h1 className="intro-title intro-accent hue-anim">
                    {screenName}'s Daily Log
                </h1>
                <p className="intro-subtitle">Remove items you don't want to keep in today's log</p>
                <div className="intro-divider" />
            </div>

            {/* summary card shows current totals against user goals */}
            <div className="log-summary">
                <div className="log-summary-title">Daily Summary</div>
                <div className="log-summary-rows">
                    <div>
                        <b>Daily Goal:</b> Calories {Number(goals.cal) || 0} kcal • Proteins {Number(goals.protein) || 0}g • Fats {Number(goals.fat) || 0}g • Carbs: {Number(goals.carbs) || 0}g
                    </div>
                    <div>
                        <b>Daily Total:</b> Calories {Math.round(Number(totals.cal) || 0)} kcal • Proteins {Math.round(Number(totals.protein) || 0)}g • Fats {Math.round(Number(totals.fat) || 0)}g • Carbs: {Math.round(Number(totals.carbs) || 0)}g
                    </div>
                </div>
            </div>

            {/* core section with loading, error, empty, and list states */}
            {loading && <div>Loading…</div>}
            {error && <div style={{ color: "crimson" }}>{error}</div>}

            {!loading && !error && (
                <>
                    {items.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-title">No items logged yet.</div>
                            <div className="empty-actions">
                                <Link to="/search" className="pill-btn">Search &amp; Log Foods</Link>
                            </div>
                        </div>
                    ) : (
                        <div className="log-list">
                            {items.map(item => (
                                <div key={item._id} className="log-card">
                                    <div>
                                        <div className="log-name">{item.name}</div>
                                        <div className="log-stats">
                                            Calories: {item.cal ?? 0} | Protein: {item.protein ?? 0}g | Fat: {item.fat ?? 0}g | Carbs: {item.carbs ?? 0}g{item.qty > 1 ? ` × ${item.qty}` : ""}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="log-remove danger-btn"
                                        onClick={() => removeOne(item._id)}
                                        aria-label={`Remove ${item.name}`}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* handy links on the bottom left so navigation stays easy */}
            <div
                style={{
                    position: "fixed",
                    left: 20,
                    bottom: 20,
                    display: "flex",
                    gap: 10,
                    zIndex: 1000
                }}
            >
                <Link to="/homepage" className="pill-btn">Home</Link>

                {items.length > 0 && (
                    <Link to="/search" className="pill-btn">Find Food</Link>
                )}
            </div>
        </div>
    );
}

/*
  helper to recompute totals from an array of entries
  respects per entry qty if present
  keeps all math guarded so nulls or missing fields do not explode
*/
function calcTotalsNew(arr) {
    return arr.reduce((a, e) => ({
        cal: a.cal + (e.cal || 0) * (e.qty || 1),
        protein: a.protein + (e.protein || 0) * (e.qty || 1),
        fat: a.fat + (e.fat || 0) * (e.qty || 1),
        carbs: a.carbs + (e.carbs || 0) * (e.qty || 1),
    }), { cal: 0, protein: 0, fat: 0, carbs: 0 });
}
