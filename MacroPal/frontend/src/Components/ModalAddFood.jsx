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

    // name validation (no digits, min 2 chars, basic characters)
    if (!n) {
      alert("Enter a valid food name (required).");
      return;
    }
    if (/\d/.test(n)) {
      alert("Food name cannot contain numbers.");
      return;
    }
    if (n.length < 2) {
      alert("Enter a valid food name (min 2 chars).");
      return;
    }
    // Optional: limit allowed characters a bit more (letters, space, apostrophe, hyphen, ampersand, period)
    if (!/^[A-Za-z][A-Za-z\s'&.\-]*$/.test(n)) {
      alert("Food name can use letters, spaces, ', -, &, . only.");
      return;
    }

    // simple numeric conversion
    const toIntSafe = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? Math.trunc(n) : null;
    };

    // validation helper
    const validateField = (val, label) => {
      if (val === "" || val === null || val === undefined) {
        alert(`${label} is required.`);
        return false;
      }
      const num = toIntSafe(val);
      if (!Number.isInteger(num) || num < 0 || num > 5000) {
        alert(`${label} must be an integer between 0 and 5000.`);
        return false;
      }
      return true;
    };

    if (
      !validateField(calories, "Calories") ||
      !validateField(protein, "Protein") ||
      !validateField(fat, "Fat") ||
      !validateField(carbs, "Carbohydrates")
    ) return;

    const cal = Math.trunc(Number(calories));
    const pro = Math.trunc(Number(protein));
    const fa  = Math.trunc(Number(fat));
    const ca  = Math.trunc(Number(carbs));

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

    // reset form
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
              // strip any digits live as the user types
              onChange={(e) => setName(e.target.value.replace(/\d/g, ""))}
              autoComplete="off"
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
              placeholder="Protein (g)*"
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
              placeholder="Fat (g)*"
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
              placeholder="Carbohydrates (g)*"
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
