/*
  food finder page

  what this screen does:
  - lets the user search for foods by name or tags
  - shows macro preview in results
  - lets them log an item directly to today's log with one click
  - when logged, it instantly sends them over to /log

  uses joseph’s new post /api/log route with payload including macros + qty
  
  @author Brian Schaeffer
  @version October 11, 2025
 */

import { useEffect, useState } from 'react';
import { ChevronDown, Star } from 'lucide-react';
import './search.css';
import { Link } from "react-router-dom";

export default function Search() {
  // core search state
  const [userSearch, setUserSearch] = useState('');
  // can be 'name' | 'tags' | 'recipes'
  const [by, setBy] = useState('name');
  const [results, setResults] = useState([]);

  // UX helpers
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // prevent spam on the “Log” button
  const [loggingId, setLoggingId] = useState(null);

  // smoother typing
  const debouncedSearch = useDebounce(userSearch, 250);

  // tiny dropdown for Name/Tags/Recipes
  const [menuOpen, setMenuOpen] = useState(false);

  // saved (star) state
  const [savedIds, setSavedIds] = useState(new Set());
  const [savedRecipeIds, setSavedRecipeIds] = useState(new Set());

  // selected cards for multi-log (foods only)
  const [selectedIds, setSelectedIds] = useState(new Set());

  // load saved foods once
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('http://localhost:5000/api/saved', {
          headers: { 'x-user-id': localStorage.getItem('mp_user_id') || '' },
          credentials: 'include',
        });
        if (!res.ok) return;
        const data = await res.json();

        // Support both old and new response shapes:
        // old:  { saved: [...] }  (foods only)
        // new:  { savedFoods: [...], savedRecipes: [...] }
        const foodsArr = Array.isArray(data?.savedFoods) ? data.savedFoods : (data?.saved || []);
        const recipesArr = Array.isArray(data?.savedRecipes) ? data.savedRecipes : [];

        const foodIds = new Set(foodsArr.map(f => f._id));
        const recipeIds = new Set(recipesArr.map(r => r._id));

        setSavedIds(foodIds);
        setSavedRecipeIds(recipeIds);
      } catch (err) {
        console.error('Failed to fetch saved items:', err);
        setSavedIds(new Set()); // reset to empty if it fails to fetch
        setSavedRecipeIds(new Set());
      }
    })();
  }, []);

  // run the search
  async function runSearch(overrideText) {
    setSubmitted(true);
    setError('');

    const raw = typeof overrideText === 'string' ? overrideText : debouncedSearch;
    const trimmedSearch = (raw || '').trim();

    if (!trimmedSearch) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // If by === 'recipes', we search recipes by name. Otherwise, we search foods by the chosen field.
      const type = by === 'recipes' ? 'recipes' : 'foods';
      const byParam = by === 'recipes' ? 'name' : by;

      const params = new URLSearchParams({ userSearch: trimmedSearch, by: byParam, type });
      const response = await fetch(`http://localhost:5000/api/search?${params.toString()}`);
      if (!response.ok) throw new Error('Network error');

      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      console.error(fetchError);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // log one item using POST /api/log (cookie session)
  async function logFood(food) {
    if (loggingId) return; // avoids double taps
    setLoggingId(food._id);

    try {
      const payload = {
        foodId: food._id,
        name: food.name ?? food.Name ?? 'Unnamed',
        cal: food.calories ?? food.Calories ?? 0,
        protein: food.protein ?? food.Protein ?? 0,
        carbs: food.carbs ?? food.Carbs ?? 0,
        fat: food.fat ?? food.Fat ?? 0,
        qty: 1,
      };

      const res = await fetch('http://localhost:5000/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to log food');
      }

      window.location.href = '/log';
    } catch (e) {
      console.error(e);
      alert(e.message || 'Could not log item.');
    } finally {
      setLoggingId(null);
    }
  }

  // toggle card selection (foods only; recipes are not selectable/loggable yet)
  function toggleSelect(foodId) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(foodId)) next.delete(foodId);
      else next.add(foodId);
      return next;
    });
  }

  // log all selected foods
  async function logAllSelected() {
    const selected = results.filter(f => selectedIds.has(f._id) && f.type !== 'recipe');
    if (selected.length === 0) return;

    try {
      for (const food of selected) {
        const payload = {
          foodId: food._id,
          name: food.name ?? food.Name ?? 'Unnamed',
          cal: food.calories ?? food.Calories ?? 0,
          protein: food.protein ?? food.Protein ?? 0,
          carbs: food.carbs ?? food.Carbs ?? 0,
          fat: food.fat ?? food.Fat ?? 0,
          qty: 1,
        };

        await fetch('http://localhost:5000/api/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
      }

      alert(`${selected.length} item(s) logged successfully!`);
      window.location.href = '/log';
    } catch (err) {
      console.error(err);
      alert('Failed to log selected items.');
    }
  }

  function clearSearch() {
    setUserSearch("");
    setResults([]);
    setError("");
    setSubmitted(false);
    setSelectedIds(new Set());
  }

  function onKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      const el = event.currentTarget;
      setTimeout(() => {
        runSearch(el.value);
      }, 0);
    }
  }

  // toggle save/unsave for a food item (foods only)
  async function toggleSave(food) {
    const id = food._id;
    const wasSaved = savedIds.has(id);

    // temporary local update
    setSavedIds(prev => {
      const next = new Set(prev);
      if (wasSaved) next.delete(id); else next.add(id);
      return next;
    });

    try {
      if (wasSaved) {
        const r = await fetch(`http://localhost:5000/api/saved/${id}`, {
          method: 'DELETE',
          headers: { 'x-user-id': localStorage.getItem('mp_user_id') || '' },
          credentials: 'include'
        });
        if (!r.ok && r.status !== 204) throw new Error();
      } else {
        const r = await fetch('http://localhost:5000/api/saved', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': localStorage.getItem('mp_user_id') || ''
          },
          credentials: 'include',
          body: JSON.stringify({ foodId: id })
        });
        if (!r.ok) throw new Error();
      }
    } catch {
      // rollback on failure
      setSavedIds(prev => {
        const next = new Set(prev);
        if (wasSaved) next.add(id); else next.delete(id);
        return next;
      });
      alert(wasSaved ? "Couldn't remove from saved." : "Couldn't save item.");
    }
  }

  // toggle save/unsave for a RECIPE item (recipes only)
  async function toggleSaveRecipe(recipe) {
    const id = recipe._id;
    const wasSaved = savedRecipeIds.has(id);

    // temporary local update
    setSavedRecipeIds(prev => {
      const next = new Set(prev);
      if (wasSaved) next.delete(id); else next.add(id);
      return next;
    });

    try {
      if (wasSaved) {
        const r = await fetch(`http://localhost:5000/api/saved/${id}?type=recipe`, {
          method: 'DELETE',
          headers: { 'x-user-id': localStorage.getItem('mp_user_id') || '' },
          credentials: 'include'
        });
        if (!r.ok && r.status !== 204) throw new Error();
      } else {
        const r = await fetch('http://localhost:5000/api/saved', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': localStorage.getItem('mp_user_id') || ''
          },
          credentials: 'include',
          body: JSON.stringify({ recipeId: id })
        });
        if (!r.ok) throw new Error();
      }
    } catch {
      // rollback on failure
      setSavedRecipeIds(prev => {
        const next = new Set(prev);
        if (wasSaved) next.add(id); else next.delete(id);
        return next;
      });
      alert(wasSaved ? "Couldn't remove recipe from saved." : "Couldn't save recipe.");
    }
  }

  const placeholder =
    by === 'recipes' ? 'Search recipes…' : `Search by ${by}…`;

  return (
    <div className="search-page" style={{ maxWidth: 760, margin: '24px auto', padding: '0 16px' }}>
      {/* slow rainbow title animation */}
      <style>{`
        @keyframes hueShift {
          0%   { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        .search-page .hue-anim {
          animation: hueShift 16s linear infinite;
        }
      `}</style>

      {/* page header */}
      <div className="intro">
        <h1
          className="intro-title intro-accent hue-anim"
          style={{
            backgroundImage: 'linear-gradient(90deg,#7aa2ff,#b38bff,#ff9fb3)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Food Finder
        </h1>
        <p className="intro-subtitle">
          {by === 'recipes'
            ? 'Search recipes by name (logging coming soon)'
            : 'Find food and quickly preview macros'}
        </p>
        <div className="intro-divider" />
      </div>

      {/* search row */}
      <div className="search-row">
        <div className="search-group">
          <input
            value={userSearch}
            onChange={(event) => setUserSearch(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            aria-label="Search text"
            className="search-input"
          />

          <div
            className={`search-select2${menuOpen ? ' open' : ''}`}
            tabIndex={0}
            role="button"
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
            onBlur={() => setMenuOpen(false)}
          >
            {/* stack label over chevron and force the icon NOT to float right */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
              <span className="label" style={{ marginBottom: 2 }}>
                {by === 'name' ? 'Name' : by === 'tags' ? 'Tags' : 'Recipes'}
              </span>
              <ChevronDown
                size={14}
                className="chev"
                aria-hidden="true"
                style={{
                  position: 'static',     // override any absolute positioning
                  marginLeft: 0,          // override any auto push to the right
                  marginTop: 2,
                  display: 'block',
                  alignSelf: 'center'
                }}
              />
            </div>

            {menuOpen && (
              <ul className="search-menu" role="listbox">
                <li
                  role="option"
                  aria-selected={by === 'name'}
                  className="search-item"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setBy('name');
                    setMenuOpen(false);
                    setSelectedIds(new Set());
                  }}
                >
                  Name
                </li>
                <li
                  role="option"
                  aria-selected={by === 'tags'}
                  className="search-item"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setBy('tags');
                    setMenuOpen(false);
                    setSelectedIds(new Set());
                  }}
                >
                  Tags
                </li>
                <li
                  role="option"
                  aria-selected={by === 'recipes'}
                  className="search-item"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setBy('recipes');
                    setMenuOpen(false);
                    setSelectedIds(new Set());
                  }}
                >
                  Recipes
                </li>
              </ul>
            )}
          </div>
        </div>

        <button onClick={() => runSearch(userSearch)} className="search-button">
          Search
        </button>

        {(userSearch.trim() || results.length > 0) && (
          <button
            type="button"
            onClick={clearSearch}
            className="search-button danger-btn"
            style={{ marginLeft: '8px' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* results / feedback */}
      {submitted && (
        <>
          {loading && <div>Searching…</div>}
          {error && <div style={{ color: 'crimson' }}>{error}</div>}

          <div style={{ display: 'grid', gap: 10 }}>
            {results.map((foodItem) => {
              const isRecipe = foodItem.type === 'recipe';
              const disabled = loggingId === foodItem._id;
              const isSavedFood = savedIds.has(foodItem._id);
              const isSavedRecipe = savedRecipeIds.has(foodItem._id);
              const isSelected = selectedIds.has(foodItem._id);

              const cardProps = isRecipe
                ? { onClick: undefined, style: { cursor: 'default' } }
                : { onClick: () => toggleSelect(foodItem._id), style: { cursor: 'pointer' } };

              return (
                <div
                  key={foodItem._id}
                  className={`search-card ${!isRecipe && isSelected ? 'selected' : ''}`}
                  {...cardProps}
                >
                  {/* Save/star for foods and recipes */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isRecipe) toggleSaveRecipe(foodItem);
                      else toggleSave(foodItem);
                    }}
                    aria-label={
                      isRecipe
                        ? (isSavedRecipe ? "Unsave recipe" : "Save recipe")
                        : (isSavedFood ? "Unsave" : "Save")
                    }
                    style={{
                      height: 30,
                      width: 30,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "transparent",
                      border: "none",
                      borderRadius: 0,
                      cursor: "pointer",
                      outline: "none",
                      transition: "transform 0.1s ease",
                      marginRight: 8,
                    }}
                  >
                    <Star
                      className={(isRecipe ? isSavedRecipe : isSavedFood) ? "star-twinkle" : ""}
                      size={20}
                      stroke={(isRecipe ? isSavedRecipe : isSavedFood) ? '#FFD700' : '#888'}
                      fill={(isRecipe ? isSavedRecipe : isSavedFood) ? '#FFD700' : 'none'}
                      strokeWidth={2}
                      style={{ display: 'block', flexShrink: 0 }}
                    />
                  </button>

                  <div>
                    <div className="search-name">
                      {foodItem.name}
                      {isRecipe && (
                        <span
                          className="pill"
                          style={{
                            marginLeft: 8,
                            fontSize: 12,
                            padding: '2px 8px',
                            border: '1px solid #2a2a2a',
                            borderRadius: 999
                          }}
                        >
                          Recipe
                        </span>
                      )}
                    </div>

                    {/* Foods show full macros; recipes show light meta if present */}
                    {!isRecipe ? (
                      <div className="search-stats">
                        Calories: {foodItem.calories ?? 0} | Protein: {foodItem.protein ?? 0}g | Fat {foodItem.fat ?? 0}g | Carbs: {foodItem.carbs ?? 0}g
                      </div>
                    ) : (
                      <div className="search-stats">
                        {(foodItem.servings != null) && <>Servings: {foodItem.servings} </>}
                        {(foodItem.calories != null) && <>| Calories: {foodItem.calories}</>}
                        {Array.isArray(foodItem.tags) && foodItem.tags.length > 0 && (
                          <> | {foodItem.tags.map(t => `#${t}`).join(' ')}</>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right-side button:
                      - Foods: active Log button (existing behavior)
                      - Recipes: show a click popup "Coming Soon" */}
                  {!isRecipe ? (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); logFood(foodItem); }}
                      aria-label={`Log ${foodItem.name}`}
                      disabled={disabled}
                      className="search-log-btn"
                    >
                      {disabled ? 'Logging…' : 'Log'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label={`Log ${foodItem.name} (coming soon)`}
                      className="search-log-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert("Coming Soon!");
                      }}
                    >
                      Log
                    </button>
                  )}
                </div>
              );
            })}

            {!loading && !error && results.length === 0 && userSearch.trim() && (
              <div>No matches</div>
            )}
          </div>
        </>
      )}

      {/* Log All Selected button (foods only) */}
      {selectedIds.size > 0 && by !== 'recipes' && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            background: "transparent",
            zIndex: 1000
          }}
        >
          <button
            type="button"
            onClick={logAllSelected}
            className="pill-btn logall-btn"
          >
            Log All Selected
          </button>
        </div>
      )}

      {/* Nav buttons */}
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
        <Link to="/log" className="pill-btn">Daily Log</Link>
      </div>
    </div>
  );
}

// tiny debounce helper
function useDebounce(value, delayMs) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const delayTimer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(delayTimer);
  }, [value, delayMs]);
  return debouncedValue;
}
