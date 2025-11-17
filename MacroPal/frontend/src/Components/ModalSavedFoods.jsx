// ModalSavedFoods.jsx
import { useEffect, useRef, useState } from "react";
import "../pages/search.css";

export default function ModalSavedFoods({
  open,
  setOpen,
  foods = [],
  recipes = [],
  onLogFood,
  onLogRecipe,
}) {
  const [activeTab, setActiveTab] = useState("foods");
  const [loggingKey, setLoggingKey] = useState(null);
  const [servings, setServings] = useState({});
  const overlayDown = useRef(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  // init servings for recipes when modal opens
  useEffect(() => {
    if (!open) return;
    const init = {};
    for (const r of recipes || []) {
      const id = r._id || r.id || r.Name || r.name || r.title;
      if (id) init[id] = 1;
    }
    setServings(init);
  }, [open, recipes]);

  if (!open) return null;

  const handleLogFood = async (food) => {
    if (!onLogFood || loggingKey) return;
    const id = food._id || food.id || food.Name || food.name;
    const key = `food:${id}`;
    setLoggingKey(key);
    try {
      const mapped = {
        _id: id,
        name: food.name ?? food.Name ?? "Unnamed",
        calories: food.calories ?? food.Calories ?? 0,
        protein: food.protein ?? food.Protein ?? 0,
        carbs: food.carbs ?? food.Carbs ?? 0,
        fat: food.fat ?? food.Fat ?? 0,
      };
      await onLogFood(mapped);
    } finally {
      setLoggingKey(null);
    }
  };

  function openRecipe(recid) {
    const id = recid;
    window.location.href = "/recipe/"+id;
  }

  const handleLogRecipe = async (recipe) => {
    if (!onLogRecipe || loggingKey) return;

    const id =
      recipe._id || recipe.id || recipe.Name || recipe.name || recipe.title;
    if (!id) return;

    const key = `recipe:${id}`;
    const s = Math.max(1, Number(servings[id] || 1));

    setLoggingKey(key);
    try {
      // same shape as ModalRecipes payload
      const payload = {
        foodId: id,
        name: recipe.Name ?? recipe.name ?? recipe.title ?? "Unnamed recipe",
        cal: (recipe.Calories ?? recipe.calories ?? 0) * s,
        protein: (recipe.Protein ?? recipe.protein ?? 0) * s,
        carbs: (recipe.Carbs ?? recipe.carbs ?? 0) * s,
        fat: (recipe.Fat ?? recipe.fat ?? 0) * s,
        qty: 1,
      };
      await onLogRecipe(payload);
    } finally {
      setLoggingKey(null);
    }
  };

  const renderFoods = () => {
    if (!foods.length) return <div>No saved foods yet.</div>;

    return (
      <div style={{ display: "grid", gap: 10 }}>
        {foods.map((food) => {
          const id = food._id || food.id || food.Name || food.name;
          const key = `food:${id}`;
          const disabled = loggingKey === key;

          const name = food.name ?? food.Name ?? "Unnamed";
          const calories = food.calories ?? food.Calories ?? 0;
          const protein = food.protein ?? food.Protein ?? 0;
          const fat = food.fat ?? food.Fat ?? 0;
          const carbs = food.carbs ?? food.Carbs ?? 0;

          return (
            <div key={id} className="search-card">
              <div>
                <div className="search-name">{name}</div>
                <div className="search-stats">
                  Calories: {calories} | Protein: {protein}g | Fat {fat}g | Carbs:{" "}
                  {carbs}g
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleLogFood({ _id: id, name, calories, protein, fat, carbs })
                }
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
    );
  };

  const renderRecipes = () => {
    if (!recipes.length) return <div>No saved recipes yet.</div>;

    return (
      <div style={{ display: "grid", gap: 10 }}>
        {recipes.map((r) => {
          const id = r._id || r.id || r.Name || r.name || r.title;
          const key = `recipe:${id}`;
          const disabled = loggingKey === key;
          const name = r.Name ?? r.name ?? r.title ?? "Unnamed recipe";
          const desc =
            r.description ?? r.desc ?? r.summary ?? "";

          const value = servings[id] ?? 1;

          return (
            <div key={id} className="search-card"
            onClick={() => openRecipe(id)}>
              <div>
                <div className="search-name">{name}</div>
                <div className="search-stats">
                  Per serving — Calories: {r.Calories ?? r.calories ?? 0} |
                  {" "}Protein: {r.Protein ?? r.protein ?? 0}g | Fat{" "}
                  {r.Fat ?? r.fat ?? 0}g | Carbs: {r.Carbs ?? r.carbs ?? 0}g
                </div>
                {desc && <div className="search-stats">{desc}</div>}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="number"
                  min="1"
                  value={value}
                  onChange={(e) => {
                    const v = e.target.value;
                    setServings((prev) => ({ ...prev, [id]: v }));
                  }}
                  aria-label="Servings"
                  style={{
                    width: 64,
                    height: 35,
                    background: "#161616",
                    color: "#f3f3f3",
                    border: "1px solid #2a2a2a",
                    borderRadius: 10,
                    padding: "0 10px",
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleLogRecipe(r)}
                  disabled={disabled}
                  className="search-log-btn"
                >
                  {disabled ? "Logging…" : "Log"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
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
        style={{
          maxWidth: 760,
          width: "92vw",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="mp-modal-header">
          <strong>Saved Items</strong>
          <button
            className="mp-btn"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* tabs */}
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "8px 16px 0 16px",
            borderBottom: "1px solid rgba(0,0,0,0.12)", // subtle divider
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("foods")}
            style={{
              outline: "none",
              flex: 1,
              padding: "8px 0",
              border: "none",
              background: "transparent",
              borderBottom:
                activeTab === "foods"
                  ? "2px solid #000"              // selected = black underline
                  : "2px solid rgba(0,0,0,0.12)", // unselected = light gray
              color: "#000",                       // clean black text
              fontWeight: activeTab === "foods" ? 600 : 500,
              cursor: "pointer",
              transition: "0.15s ease",
            }}
          >
            Foods
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("recipes")}
            style={{
              outline: "none",
              flex: 1,
              padding: "8px 0",
              border: "none",
              background: "transparent",
              borderBottom:
                activeTab === "recipes"
                  ? "2px solid #000"              // black when active
                  : "2px solid rgba(0,0,0,0.12)", // thin light gray when inactive
              color: "#000",
              fontWeight: activeTab === "recipes" ? 600 : 500,
              cursor: "pointer",
              transition: "0.15s ease",
            }}
          >
            Recipes
          </button>
        </div>

        <div
          className="mp-modal-body search-page"
          style={{ overflow: "auto", padding: "8px 16px 24px 16px" }}
        >
          {activeTab === "foods" ? renderFoods() : renderRecipes()}
        </div>

      </div>
    </div>
  );
}
