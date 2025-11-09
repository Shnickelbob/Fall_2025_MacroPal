import { useEffect, useRef, useState } from "react";
import "../pages/search.css";

export default function ModalRecipes({ open, setOpen, items = [], onLog }) {
  const [servings, setServings] = useState({});
  const [busy, setBusy] = useState(null);
  const overlayDown = useRef(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  useEffect(() => {
    if (!open) return;
    const init = {};
    for (const r of items) init[r._id] = 1;
    setServings(init);
  }, [open, items]);

  if (!open) return null;

  const log = async (r) => {
    if (busy) return;
    const s = Math.max(1, Number(servings[r._id] || 1));
    setBusy(r._id);
    try {
      // Model uses capitalized fields: Name, Calories, Protein, Fat, Carbs
      const payload = {
        foodId: r._id,
        name: r.Name,
        cal: (r.Calories || 0) * s,
        protein: (r.Protein || 0) * s,
        carbs: (r.Carbs || 0) * s,
        fat: (r.Fat || 0) * s,
        qty: 1,
      };
      await onLog(payload);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      className="mp-modal-overlay"
      role="dialog"
      aria-modal="true"
      onMouseDown={() => (overlayDown.current = true)}
      onClick={() => {
        if (overlayDown.current) setOpen(false);
        overlayDown.current = false;
      }}
    >
      <div
        className="mp-modal-card"
        onMouseDown={(e) => {
          e.stopPropagation();
          overlayDown.current = false;
        }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 760, width: "92vw", maxHeight: "80vh", display: "flex", flexDirection: "column" }}
      >
        <div className="mp-modal-header">
          <strong>Log Recipe</strong>
          <button className="mp-btn" onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>

        <div className="mp-modal-body" style={{ overflow: "auto", paddingBottom: 8 }}>
          <div style={{ display: "grid", gap: 10 }}>
            {items.length === 0 && <div>No recipes found.</div>}
            {items.map((r) => (
              <div key={r._id} className="search-card">
                <div>
                  <div className="search-name">{r.Name}</div>
                  <div className="search-stats">
                    Per serving — Calories: {r.Calories ?? 0} | Protein: {r.Protein ?? 0}g | Fat {r.Fat ?? 0}g | Carbs: {r.Carbs ?? 0}g
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="number"
                    min="1"
                    value={servings[r._id] ?? 1}
                    onChange={(e) => {
                      const v = e.target.value;
                      setServings((prev) => ({ ...prev, [r._id]: v }));
                    }}
                    style={{ width: 64, height: 32, background: "#161616", color: "#f3f3f3", border: "1px solid #2a2a2a", borderRadius: 8, padding: "0 8px" }}
                    aria-label="Servings"
                  />
                  <button
                    type="button"
                    onClick={() => log(r)}
                    disabled={busy === r._id}
                    className="search-log-btn"
                  >
                    {busy === r._id ? "Logging…" : "Log"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mp-modal-footer">
          <button className="mp-btn" onClick={() => setOpen(false)}>Close</button>
        </div>
      </div>
    </div>
  );
}
