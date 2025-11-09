// ModalSavedFoods.jsx
import { useEffect, useRef, useState } from "react";
import "../pages/search.css";

export default function ModalSavedFoods({ open, setOpen, items = [], onLog }) {
  const [loggingId, setLoggingId] = useState(null);
  const overlayDown = useRef(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  const handleLog = async (food) => {
    if (loggingId) return;
    const id = food._id || food.id || food.Name || food.name;
    setLoggingId(id);
    try {
      const mapped = {
        _id: id,
        name: food.name ?? food.Name ?? "Unnamed",
        calories: food.calories ?? food.Calories ?? 0,
        protein: food.protein ?? food.Protein ?? 0,
        carbs: food.carbs ?? food.Carbs ?? 0,
        fat: food.fat ?? food.Fat ?? 0,
      };
      await onLog?.(mapped);
    } finally {
      setLoggingId(null);
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
          <strong>Saved Foods</strong>
          <button className="mp-btn" onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>

        {/* 👇 add "search-page" so .search-card styles apply */}
        <div className="mp-modal-body search-page" style={{ overflow: "auto", paddingBottom: 8 }}>
          <div style={{ display: "grid", gap: 10 }}>
            {items.length === 0 && <div>No saved foods yet.</div>}
            {items.map((food) => {
              const id = food._id || food.id || food.Name || food.name;
              const disabled = loggingId === id;
              const name = food.name ?? food.Name ?? "Unnamed";
              const calories = food.calories ?? food.Calories ?? 0;
              const protein  = food.protein  ?? food.Protein  ?? 0;
              const fat      = food.fat      ?? food.Fat      ?? 0;
              const carbs    = food.carbs    ?? food.Carbs    ?? 0;

              return (
                <div key={id} className="search-card">
                  <div>
                    <div className="search-name">{name}</div>
                    <div className="search-stats">
                      Calories: {calories} | Protein: {protein}g | Fat {fat}g | Carbs: {carbs}g
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLog({ _id: id, name, calories, protein, fat, carbs })}
                    aria-label={`Log ${name}`}
                    disabled={disabled}
                    className="search-log-btn"
                  >
                    {disabled ? "Logging…" : "Log"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mp-modal-footer">
          <button className="mp-btn" onClick={() => setOpen(false)}>Close</button>
        </div>
      </div>
    </div>
  );
}
