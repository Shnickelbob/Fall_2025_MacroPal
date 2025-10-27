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
import { ChevronDown } from 'lucide-react';
import './search.css';
import { Link } from "react-router-dom";

export default function Search() {
  // core search state
  const [userSearch, setUserSearch] = useState('');
  const [by, setBy] = useState('name');
  const [results, setResults] = useState([]);

  // UX helpers
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // prevent spam on the “Log” button
  const [loggingId, setLoggingId] = useState(null);

  // smoother typing means fewer requests
  const debouncedSearch = useDebounce(userSearch, 250);

  // tiny dropdown for Name/Tags
  const [menuOpen, setMenuOpen] = useState(false);

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
      const params = new URLSearchParams({ userSearch: trimmedSearch, by });
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

  function clearSearch() {
    setUserSearch("");
    setResults([]);
    setError("");
    setSubmitted(false);
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

  return (
    <div style={{ maxWidth: 760, margin: '24px auto', padding: '0 16px' }}>
      {/* slow rainbow title animation */}
      <style>{`
        @keyframes hueShift {
          0%   { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        .hue-anim {
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
        <p className="intro-subtitle">Find foods by name or tags and quickly preview macros</p>
        <div className="intro-divider" />
      </div>

      {/* search row */}
      <div className="search-row">
        <div className="search-group">
          {/* text input */}
          <input
            value={userSearch}
            onChange={(event) => setUserSearch(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={`Search by ${by}…`}
            aria-label="Search text"
            className="search-input"
          />

          {/* Name/Tags pill */}
          <div
            className={`search-select2${menuOpen ? ' open' : ''}`}
            tabIndex={0}
            role="button"
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
            onBlur={() => setMenuOpen(false)}
          >
            <span className="label">{by === 'name' ? 'Name' : 'Tags'}</span>
            <ChevronDown size={18} className="chev" />
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
                  }}
                >
                  Tags
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* submits the users input */}
        <button onClick={() => runSearch(userSearch)} className="search-button">
          Search
        </button>

        {/* clears the input and results */}
        {/* only shows Clear if there's text or results */}
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
              const disabled = loggingId === foodItem._id;
              return (
                <div key={foodItem._id} className="search-card">
                  <div>
                    <div className="search-name">{foodItem.name}</div>
                    <div className="search-stats">
                      Calories: {foodItem.calories ?? 0} | Protein: {foodItem.protein ?? 0}g | Fat {foodItem.fat ?? 0}g | Carbs: {foodItem.carbs ?? 0}g
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => logFood(foodItem)}
                    aria-label={`Log ${foodItem.name}`}
                    disabled={disabled}
                    className="search-log-btn"
                  >
                    {disabled ? 'Logging…' : 'Log'}
                  </button>
                </div>
              );
            })}

            {!loading && !error && results.length === 0 && userSearch.trim() && (
              <div>No matches</div>
            )}
          </div>
        </>
      )}

      {/* Button link on the lower left side for easy navigation to the Daily Log page */}
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
