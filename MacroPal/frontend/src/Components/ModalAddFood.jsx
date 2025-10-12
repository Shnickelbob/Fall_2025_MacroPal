import { useEffect, useRef, useState } from "react";
import "../App.css";

function ModalAddFood({ open, setOpen, onSubmit }) {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [carbs, setCarbs] = useState("");
  const [tags, setTags] = useState([""]);
  const backdropMouseDownOnOverlay = useRef(false);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, setOpen]);

  if (!open) return null;

  const blockNonInt = (e) => {
    if (["e", "E", "+", "-", ".", ","].includes(e.key)) e.preventDefault();
  };
  const onlyDigits = (v) => v.replace(/\D/g, "");
  const toInt = (v, def = 0) => {
    if (v === "" || v === null || v === undefined) return def;
    const n = Math.trunc(Number(v));
    return Number.isFinite(n) ? n : def;
  };

  const handleSubmit = () => {
    const n = name.trim();
    if (n.length < 2) return alert("Enter a valid food name (min 2 chars).");
    const cal = toInt(calories, NaN);
    if (!Number.isInteger(cal) || cal < 0 || cal > 5000)
      return alert("Calories must be an integer between 0 and 5000.");
    const pro = toInt(protein, 0);
    const fa = toInt(fat, 0);
    const ca = toInt(carbs, 0);
    for (const [label, val] of [
      ["Protein", pro],
      ["Fat", fa],
      ["Carbohydrates", ca],
    ]) {
      if (!Number.isInteger(val) || val < 0 || val > 5000)
        return alert(`${label} must be an integer between 0 and 5000.`);
    }

    const cleanTags = tags
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0 && t.length <= 30);

    onSubmit?.({
      Name: n,
      Calories: cal,
      Protein: pro,
      Fat: fa,
      Carbs: ca,
      Tags: cleanTags,
    });

    setName("");
    setCalories("");
    setProtein("");
    setFat("");
    setCarbs("");
    setTags([""]);
    setOpen(false);
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
          <strong>Add Food</strong>
          <button className="mp-btn" onClick={() => setOpen(false)} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="mp-modal-body">
          <div className="mp-form">
            <input
              className="mp-input"
              placeholder="Food name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="mp-input"
              type="number"
              inputMode="numeric"
              min="0"
              max="5000"
              step="1"
              placeholder="Calories *"
              value={calories}
              onKeyDown={blockNonInt}
              onChange={(e) => setCalories(onlyDigits(e.target.value))}
            />

            <input
              className="mp-input"
              type="number"
              inputMode="numeric"
              min="0"
              max="5000"
              step="1"
              placeholder="Protein (g)"
              value={protein}
              onKeyDown={blockNonInt}
              onChange={(e) => setProtein(onlyDigits(e.target.value))}
            />

            <input
              className="mp-input"
              type="number"
              inputMode="numeric"
              min="0"
              max="5000"
              step="1"
              placeholder="Fat (g)"
              value={fat}
              onKeyDown={blockNonInt}
              onChange={(e) => setFat(onlyDigits(e.target.value))}
            />

            <input
              className="mp-input"
              type="number"
              inputMode="numeric"
              min="0"
              max="5000"
              step="1"
              placeholder="Carbohydrates (g)"
              value={carbs}
              onKeyDown={blockNonInt}
              onChange={(e) => setCarbs(onlyDigits(e.target.value))}
            />

            {tags.map((t, i) => (
              <div key={i} className="mp-tag-row" style={{ display: "flex", gap: 8 }}>
                <input
                  className="mp-input"
                  placeholder={`Tag ${i + 1}`}
                  value={t}
                  onChange={(e) => {
                    const v = [...tags];
                    v[i] = e.target.value;
                    setTags(v);
                  }}
                />
                <button
                  type="button"
                  className="mp-btn"
                  onClick={() => setTags((v) => v.filter((_, idx) => idx !== i))}
                  aria-label="Remove tag"
                >
                  −
                </button>
              </div>
            ))}

            <button
              type="button"
              className="mp-btn"
              onClick={() => setTags((v) => [...v, ""])}
            >
              Add tag
            </button>
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

export default ModalAddFood;
