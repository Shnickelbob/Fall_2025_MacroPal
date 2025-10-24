import { useEffect, useRef, useState } from "react";
import "../App.css";

function ModalGoalVals({ open, setOpen, onSubmit /* initialGoals is optional but unused here for value binding */ }) {
  const [calories, setCalories] = useState("");
  const [protein, setProtein]   = useState("");
  const [fat, setFat]           = useState("");
  const [carbs, setCarbs]       = useState("");
  const backdropMouseDownOnOverlay = useRef(false);

  // On open: keep inputs EMPTY so placeholders show; don't preload values
  useEffect(() => {
    if (!open) return;

    setCalories("");
    setProtein("");
    setFat("");
    setCarbs("");

    const handleKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, setOpen]);

  if (!open) return null;

  const blockNonInt = (e) => {
    if (["e", "E", "+", "-", ".", ","].includes(e.key)) e.preventDefault();
  };
  const onlyDigits = (v) => v.replace(/\D/g, "");

  const handleSubmit = async () => {
    const patch = {};

    const addIfChanged = (key, value, label) => {
      if (value === "") return; // unchanged
      const n = Math.trunc(Number(value));
      if (!Number.isInteger(n) || n < 0 || n > 5000) {
        alert(`${label} must be an integer between 0 and 5000.`);
        throw new Error("Validation failed");
      }
      patch[key] = n;
    };

    try {
      addIfChanged("cal", calories, "Calories");
      addIfChanged("protein", protein, "Protein");
      addIfChanged("carbs", carbs, "Carbohydrates");
      addIfChanged("fat", fat, "Fat");

      if (Object.keys(patch).length === 0) {
        setOpen(false);
        return;
      }

      await onSubmit?.(patch);

      // clear after successful save
      setCalories("");
      setProtein("");
      setFat("");
      setCarbs("");
      setOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      className="mp-modal-overlay"
      role="dialog"
      aria-modal="true"
      onMouseDown={() => (backdropMouseDownOnOverlay.current = true)}
      onClick={() => {
        if (backdropMouseDownOnOverlay.current) setOpen(false);
        backdropMouseDownOnOverlay.current = false;
      }}
    >
      <div
        className="mp-modal-card"
        onMouseDown={(e) => {
          e.stopPropagation();
          backdropMouseDownOnOverlay.current = false;
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mp-modal-header">
          <strong>Edit Nutritional Goal Values</strong>
          <button className="mp-btn" onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>

        <div className="mp-modal-body">
          <div className="mp-form">
            <input
              className="mp-input"
              type="number"
              inputMode="numeric"
              min="0" max="5000" step="1"
              placeholder="Calories"
              value={calories}
              onKeyDown={blockNonInt}
              onChange={(e) => setCalories(onlyDigits(e.target.value))}
              autoComplete="off"
            />

            <input
              className="mp-input"
              type="number"
              inputMode="numeric"
              min="0" max="5000" step="1"
              placeholder="Protein (g)"
              value={protein}
              onKeyDown={blockNonInt}
              onChange={(e) => setProtein(onlyDigits(e.target.value))}
              autoComplete="off"
            />

            <input
              className="mp-input"
              type="number"
              inputMode="numeric"
              min="0" max="5000" step="1"
              placeholder="Carbohydrates (g)"
              value={carbs}
              onKeyDown={blockNonInt}
              onChange={(e) => setCarbs(onlyDigits(e.target.value))}
              autoComplete="off"
            />

            <input
              className="mp-input"
              type="number"
              inputMode="numeric"
              min="0" max="5000" step="1"
              placeholder="Fat (g)"
              value={fat}
              onKeyDown={blockNonInt}
              onChange={(e) => setFat(onlyDigits(e.target.value))}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="mp-modal-footer">
          <button className="mp-btn mp-btn-primary" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalGoalVals;
