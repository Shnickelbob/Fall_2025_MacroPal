// Reusable Add Food modal
// Usage example:
// const [open, setOpen] = useState(false);
// <button onClick={() => setOpen(true)}>Add Food</button>
// <ModalAddFood open={open} setOpen={setOpen} onSubmit={(data) => console.log(data)} />

import { useEffect, useRef, useState } from "react";
import "../App.css";

function ModalAddFood({ open, setOpen, onSubmit }) {
  const [name, setName] = useState("");
  const [servingSizeValue, setServingSizeValue] = useState("");
  const [servingSizeUnit, setServingSizeUnit] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const backdropMouseDownOnOverlay = useRef(false);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, setOpen]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!name.trim()) return alert("Enter a food name.");
    if (!servingSizeValue || Number(servingSizeValue) <= 0)
      return alert("Serving size must be greater than 0.");
    if (!servingSizeUnit) return alert("Select a serving unit.");
    if (calories === "" || Number(calories) < 0)
      return alert("Calories must be 0 or more.");

    onSubmit?.({
      name: name.trim(),
      servingSizeValue: Number(servingSizeValue),
      servingSizeUnit,
      calories: Number(calories),
      protein: protein === "" ? 0 : Number(protein),
      carbs: carbs === "" ? 0 : Number(carbs),
      fat: fat === "" ? 0 : Number(fat),
    });

    setName("");
    setServingSizeValue("");
    setServingSizeUnit("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
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
              placeholder="Serving size *"
              value={servingSizeValue}
              onChange={(e) => setServingSizeValue(e.target.value)}
            />
            <select
              className="mp-input"
              value={servingSizeUnit}
              onChange={(e) => setServingSizeUnit(e.target.value)}
            >
              <option value="" disabled>
                Select unit
              </option>
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="oz">oz</option>
              <option value="cup">cup</option>
              <option value="tbsp">tbsp</option>
              <option value="tsp">tsp</option>
              <option value="piece">piece</option>
            </select>
            <input
              className="mp-input"
              type="number"
              placeholder="Calories *"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
            />
            <input
              className="mp-input"
              type="number"
              placeholder="Protein (g)"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
            />
            <input
              className="mp-input"
              type="number"
              placeholder="Carbs (g)"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
            />
            <input
              className="mp-input"
              type="number"
              placeholder="Fat (g)"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
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

export default ModalAddFood;
