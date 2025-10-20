/**
 * This file builds the Food Finder page.
 * It lets users search for foods by name or tag, view basic nutrition info,
 * and see results update right on the page.
 *
 * @author Brian Schaeffer
 * @version October 11, 2025
*/

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './search.css';

export default function Search() {
    // Keeps track of what the user types in the search box
    const [userSearch, setUserSearch] = useState('');
    // Tracks if we are searching by name or tags
    const [by, setBy] = useState('name');
    // Holds all the foods found by the search
    const [results, setResults] = useState([]);
    // Shows whether the app is waiting for results
    const [loading, setLoading] = useState(false);
    // Stores an error message if something goes wrong
    const [error, setError] = useState('');
    // Keeps track of whether the user has searched yet
    const [submitted, setSubmitted] = useState(false);

    // Makes typing smoother by waiting a short moment before searching
    const debouncedSearch = useDebounce(userSearch, 250);
    // Controls whether the dropdown menu (Name/Tags) is open
    const [menuOpen, setMenuOpen] = useState(false);

    // Runs when the user clicks "Search" or presses Enter
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
            // Send a request to the backend with search text and type
            const params = new URLSearchParams({ userSearch: trimmedSearch, by });
            const response = await fetch(`http://localhost:5000/api/search?${params.toString()}`);
            if (!response.ok) throw new Error('Network error');
            const data = await response.json();
            // Save the results if valid
            setResults(Array.isArray(data) ? data : []);
        } catch (fetchError) {
            console.error(fetchError);
            setError('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    // Lets user press Enter instead of clicking the button
    function onKeyDown(event) {
        if (event.key === 'Enter') runSearch();
    }

async function handleLogFood(food) {
  const payload = {
    name: food.name ?? food.Name ?? "Unnamed",
    cal: food.calories ?? food.Calories ?? 0,
    protein: food.protein ?? food.Protein ?? 0,
    carbs: food.carbs ?? food.Carbs ?? 0,
    fat: food.fat ?? food.Fat ?? 0,
    qty: 1,
  };

  try {
    const res = await fetch("http://localhost:5000/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Failed to log food");
    }
    alert(`${payload.name} added to today's log!`);
  } catch (e) {
    alert(e.message);
  }
}

    return (
        <div style={{ maxWidth: 760, margin: '24px auto', padding: '0 16px' }}>
            {/* Slow rainbow animation for the title */}
            <style>{`
              @keyframes hueShift {
                0%   { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
              }
              .hue-anim {
                animation: hueShift 16s linear infinite;
              }
            `}</style>

            {/* Title and description */}
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

            {/* Search bar row */}
            <div className="search-row">
                <div className="search-group">
                    {/* Text box for typing search terms */}
                    <input
                        value={userSearch}
                        onChange={event => setUserSearch(event.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder={`Search by ${by}…`}
                        aria-label="Search text"
                        className="search-input"
                    />

                    {/* Dropdown menu for choosing “Name” or “Tags” */}
                    <div
                        className={`search-select2${menuOpen ? " open" : ""}`}
                        tabIndex={0}
                        role="button"
                        aria-haspopup="listbox"
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen(isOpen => !isOpen)}
                        onBlur={() => setMenuOpen(false)}
                    >
                        <span className="label">{by === "name" ? "Name" : "Tags"}</span>
                        <ChevronDown size={18} className="chev" />
                        {menuOpen && (
                            <ul className="search-menu" role="listbox">
                                <li
                                    role="option"
                                    aria-selected={by === "name"}
                                    className="search-item"
                                    onMouseDown={event => event.preventDefault()}
                                    onClick={() => { setBy("name"); setMenuOpen(false); }}
                                >
                                    Name
                                </li>
                                <li
                                    role="option"
                                    aria-selected={by === "tags"}
                                    className="search-item"
                                    onMouseDown={event => event.preventDefault()}
                                    onClick={() => { setBy("tags"); setMenuOpen(false); }}
                                >
                                    Tags
                                </li>
                            </ul>
                        )}
                    </div>
                </div>

                {/* Main search button */}
                <button onClick={runSearch} className="search-button">
                    Search
                </button>
            </div>

            {/* Area showing results or messages */}
            {submitted && (
                <>
                    {loading && <div>Searching…</div>}
                    {error && <div style={{ color: 'crimson' }}>{error}</div>}

                    {/* List of foods returned from the search */}
                    <div style={{ display: 'grid', gap: 10 }}>
                        {results.map(foodItem => (
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

                                {/* Placeholder Log button for future feature */}
                                <button
                                    type="button"
                                    onClick={() => handleLogFood(foodItem)}
                                    aria-label="Log (coming soon)"
                                    style={{
                                        padding: '6px 10px',
                                        borderRadius: 8,
                                        border: '1px solid #ddd',
                                        background: 'transparent',
                                        color: '#eaeaea',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Log
                                </button>
                            </div>
                        ))}

                        {/* Message if nothing was found */}
                        {!loading && !error && results.length === 0 && userSearch.trim() && (
                            <div>No matches</div>
                        )}
                    </div>
                </>
            )}

        <button
            className="mp-btn"
            style={{ position: "absolute", top: 20, left: 20 }}
            onClick={() => window.history.back()}
        >
            ← Back
        </button>

        </div>
    );
}

// Small helper that delays updates while typing
function useDebounce(value, delayMs) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const delayTimer = setTimeout(() => setDebouncedValue(value), delayMs);
        return () => clearTimeout(delayTimer);
    }, [value, delayMs]);
    return debouncedValue;
}
