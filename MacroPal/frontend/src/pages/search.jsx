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

    // smoother typing -> fewer requests
    const debouncedSearch = useDebounce(userSearch, 250);

    // tiny dropdown for Name/Tags
    const [menuOpen, setMenuOpen] = useState(false);

    // run the search
    async function runSearch() {
        setSubmitted(true);
        setError('');
        const trimmedSearch = debouncedSearch.trim();
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

    // log one item using the new POST /api/log body shape
    async function logFood(food) {
        // soft lock to avoid double taps
        if (loggingId) return;
        setLoggingId(food._id);

        try {
            const payload = {
                foodId: food._id,
                name: food.name,
                cal: food.calories ?? 0,
                protein: food.protein ?? 0,
                carbs: food.carbs ?? 0,
                fat: food.fat ?? 0,
                qty: 1,
            };
            const res = await fetch("http://localhost:5000/api/log", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": localStorage.getItem("mp_user_id") || ""
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Failed to log");

            // bounce to the Daily Log so they can see it right away
            window.location.href = "/log";
        } catch (e) {
            console.error(e);
            alert("Could not log item.");
        } finally {
            setLoggingId(null);
        }
    }

    // Enter to search
    function onKeyDown(event) {
        if (event.key === 'Enter') runSearch();
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
                        color: 'transparent'
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
                        onChange={event => setUserSearch(event.target.value)}
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
                        onClick={() => setMenuOpen(isOpen => !isOpen)}
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
                                    onMouseDown={event => event.preventDefault()} // keep focus so click registers
                                    onClick={() => { setBy('name'); setMenuOpen(false); }}
                                >
                                    Name
                                </li>
                                <li
                                    role="option"
                                    aria-selected={by === 'tags'}
                                    className="search-item"
                                    onMouseDown={event => event.preventDefault()}
                                    onClick={() => { setBy('tags'); setMenuOpen(false); }}
                                >
                                    Tags
                                </li>
                            </ul>
                        )}
                    </div>
                </div>

                {/* go search */}
                <button onClick={runSearch} className="search-button">
                    Search
                </button>
            </div>

            {/* results / feedback */}
            {submitted && (
                <>
                    {loading && <div>Searching…</div>}
                    {error && <div style={{ color: 'crimson' }}>{error}</div>}

                    <div style={{ display: 'grid', gap: 10 }}>
                        {results.map(foodItem => {
                            const disabled = loggingId === foodItem._id;
                            return (
                                <div
                                    key={foodItem._id}
                                    style={{
                                        border: '1px solid #eee',
                                        borderRadius: 10,
                                        padding: 12,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{foodItem.name}</div>
                                        <div style={{ fontSize: 14, opacity: 0.85 }}>
                                            Calories: {foodItem.calories ?? 0} | Protein: {foodItem.protein ?? 0}g | Fat: {foodItem.fat ?? 0}g | Carbs: {foodItem.carbs ?? 0}g
                                        </div>
                                    </div>

                                    {/* log to today (new POST /api/log body) */}
                                    <button
                                        type="button"
                                        onClick={() => logFood(foodItem)}
                                        aria-label={`Log ${foodItem.name}`}
                                        disabled={disabled}
                                        style={{
                                            padding: '6px 10px',
                                            borderRadius: 8,
                                            border: '1px solid #ddd',
                                            background: 'transparent',
                                            color: '#eaeaea',
                                            cursor: disabled ? 'not-allowed' : 'pointer',
                                            opacity: disabled ? 0.6 : 1
                                        }}
                                    >
                                        {disabled ? 'Logging…' : 'Log'}
                                    </button>
                                </div>
                            );
                        })}

                        {/* if we tried and came up empty */}
                        {!loading && !error && results.length === 0 && userSearch.trim() && (
                            <div>No matches</div>
                        )}
                    </div>
                </>
            )}

            {/* your standard back button */}
            <button
                className="mp-btn"
                style={{ position: 'absolute', top: 20, left: 20 }}
                onClick={() => window.history.back()}
            >
                ← Back
            </button>
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
