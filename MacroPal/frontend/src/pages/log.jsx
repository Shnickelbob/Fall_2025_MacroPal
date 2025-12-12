/*
  daily log page (frontend)

  what this screen does:
  - fetches today's logged items for the current user from the backend
  - shows a quick summary of totals vs goals
  - lets the user remove a single logged entry
  - NEW: lets the user select multiple entries and remove them all at once
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

    const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
    /*
      initial load
      grabs today's log using the new route and normalizes numbers to be safe
      also pulls the saved screen name so the header feels personal
    */

    const [selectedIds, setSelectedIds] = useState(new Set());

    useEffect(() => {
        (async () => {
            try {
                setError("");

                const res = await fetch(`%{API}/api/log/today`, {
                    headers: { "x-user-id": localStorage.getItem("mp_user_id") || "" },
                    credentials: "include",
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

                const list = Array.isArray(data.entries) ? data.entries : [];

                // optimistic ui: yank it locally and recompute totals
                setItems(list);
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
    // helper to recompute totals
    function calcTotalsNew(arr) {
        return arr.reduce(
            (a, e) => ({
                cal: a.cal + (e.cal || 0) * (e.qty || 1),
                protein: a.protein + (e.protein || 0) * (e.qty || 1),
                fat: a.fat + (e.fat || 0) * (e.qty || 1),
                carbs: a.carbs + (e.carbs || 0) * (e.qty || 1),
            }),
            { cal: 0, protein: 0, fat: 0, carbs: 0 }
        );
    }

    async function removeOne(entryId) {
        const prev = items;
        const next = prev.filter((x) => x._id !== entryId);

        setItems(next);
        setTotals(calcTotalsNew(next));
        setSelectedIds((old) => {
            const n = new Set(old);
            n.delete(entryId);
            return n;
        });

        try {
            const res = await fetch(`${API}/api/log/${entryId}`, {
                method: "DELETE",
                headers: { "x-user-id": localStorage.getItem("mp_user_id") || "" },
                credentials: "include",
            });
            if (!res.ok && res.status !== 204) throw new Error("Delete failed");
        } catch (e) {
            console.error(e);
            setItems(prev);
            setTotals(calcTotalsNew(prev));
            alert("Failed to remove item.");
        }
    }

    function toggleSelect(entryId) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(entryId)) next.delete(entryId);
            else next.add(entryId);
            return next;
        });
    }

    async function removeAllSelected() {
        if (selectedIds.size === 0) return;

        const idsToRemove = Array.from(selectedIds);
        const prev = items;

        const next = prev.filter((x) => !selectedIds.has(x._id));
        setItems(next);
        setTotals(calcTotalsNew(next));
        setSelectedIds(new Set());

        const failures = [];
        for (const id of idsToRemove) {
            try {
                const res = await fetch(`${API}/api/log/${id}`, {
                    method: "DELETE",
                    headers: { "x-user-id": localStorage.getItem("mp_user_id") || "" },
                    credentials: "include",
                });
                if (!res.ok && res.status !== 204) failures.push(id);
            } catch {
                failures.push(id);
            }
        }

        if (failures.length) {
            const restored = [
                ...next,
                ...prev.filter((x) => failures.includes(x._id)),
            ];
            setItems(restored);
            setTotals(calcTotalsNew(restored));
            alert(`Some items could not be removed (${failures.length}).`);
        }
    }

    return (
        <div className="log-container">
            {/* header */}
            <div className="intro">
                <h1 className="intro-title intro-accent hue-anim">
                    {screenName}'s Daily Log
                </h1>
                <p className="intro-subtitle">
                    Remove items you don't want to keep in today's log
                </p>
                <div className="intro-divider" />
            </div>

            {/* summary */}
            <div className="log-summary">
                <div className="log-summary-title">Daily Summary</div>
                <div className="log-summary-rows">
                    <div>
                        <b>Daily Goal:</b> Calories {Number(goals.cal) || 0} kcal • Proteins{" "}
                        {Number(goals.protein) || 0}g • Fats {Number(goals.fat) || 0}g •
                        Carbs: {Number(goals.carbs) || 0}g
                    </div>
                    <div>
                        <b>Daily Total:</b> Calories {Math.round(Number(totals.cal) || 0)}{" "}
                        kcal • Proteins {Math.round(Number(totals.protein) || 0)}g • Fats{" "}
                        {Math.round(Number(totals.fat) || 0)}g • Carbs:{" "}
                        {Math.round(Number(totals.carbs) || 0)}g
                    </div>
                </div>
            </div>

            {/* body states */}
            {loading && <div>Loading…</div>}
            {error && <div style={{ color: "crimson" }}>{error}</div>}

            {!loading && !error && (
                <>
                    {items.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-title">No items logged yet.</div>
                            <div className="empty-actions">
                                <Link to="/search" className="pill-btn">
                                    Search &amp; Log Foods
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="log-list">
                            {items.map((item) => {
                                const isSelected = selectedIds.has(item._id);
                                return (
                                    <div
                                        key={item._id}
                                        className={`log-card ${isSelected ? "selected" : ""}`}
                                        onClick={() => toggleSelect(item._id)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div>
                                            {/* top row: name on left, servings badge on right (if > 1) */}
                                            <div className="log-header-row">
                                                <div className="log-name">{item.name}</div>
                                                {item.servings > 1 && (
                                                    <span className="log-servings-pill">
                                                        {item.servings} serving{item.servings > 1 ? "s" : ""}
                                                    </span>
                                                )}
                                            </div>

                                            {/* second row: macro stats only */}
                                            <div className="log-stats">
                                                Calories: {item.cal ?? 0} | Protein: {item.protein ?? 0}g | Fat: {item.fat ?? 0}g | Carbs: {item.carbs ?? 0}g
                                                {item.qty > 1 ? ` × ${item.qty}` : ""}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="log-remove danger-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeOne(item._id);
                                            }}
                                            aria-label={`Remove ${item.name}`}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* Bottom-right "Remove All Selected" (appears when any selected) */}
            {selectedIds.size > 0 && (
                <div
                    style={{
                        position: "fixed",
                        bottom: 20,
                        right: 20,
                        background: "transparent",
                        zIndex: 1000,
                    }}
                >
                    <button
                        type="button"
                        onClick={removeAllSelected}
                        className="pill-btn removeall-btn"
                        title="Remove all selected items"
                    >
                        Remove All Selected
                    </button>
                </div>
            )}

            {/* Bottom-left nav buttons */}
            <div
                style={{
                    position: "fixed",
                    left: 20,
                    bottom: 20,
                    display: "flex",
                    gap: 10,
                    zIndex: 1000,
                }}
            >
                <Link to="/homepage" className="pill-btn">
                    Home
                </Link>
                <Link to="/search" className="pill-btn">
                    Find Food
                </Link>
            </div>
        </div>
    );
}