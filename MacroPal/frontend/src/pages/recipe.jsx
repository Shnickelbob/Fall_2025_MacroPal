import { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";


export default function Recipe() {
    /* state for data and page chrome */
    const { id }  = useParams();
    const [loading, setLoading] = useState(true);
    const [recipe, setRecipe] = useState({}); // recipes from backend
    const [screenName, setScreenName] = useState("User");
    const [error, setError] = useState("");

  
    useEffect(() => {
        (async () => {
            try {
                setError("");
                
                const url = id ? `http://localhost:5000/api/recipe/${id}` : "http://localhost:5000/api/recipe";
                
                const res = await fetch(url, {
                    headers: {
                        "x-user-id": localStorage.getItem("mp_user_id") || ""
                    }
                });

                if (!res.ok) throw new Error("Failed to load recipe");
                const data = await res.json();


                setRecipe(id ? data.recipe : data.recipes[0]);

                // show their screen name from login (saved in localStorage)
                setScreenName(localStorage.getItem("mp_screen_name") || "User");
            } catch (e) {
                console.error(e);
                setError("Failed to load recipe.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);


    return (
        <div className="recipe-container">
            {/* page header section with friendly intro */}
            <div className="intro">
                <h1 className="intro-title intro-accent hue-anim">
                    {recipe.Name || "Recipe"}
                </h1>
                <p>
                    {recipe.Description || "Delicious recipe details below."}
                </p>
                <div className="intro-divider" />
            </div>


            
            {loading && <div>Loading…</div>}
            {error && <div style={{ color: "crimson" }}>{error}</div>}

            {!loading && !error && (
                <>
                    <div className="recipe-details">
                        <h2>Ingredients:</h2>
                        <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                            {recipe.Ingredients && recipe.Ingredients.length > 0 ? (
                                recipe.Ingredients.map((ingredient, index) => (
                                    <li key={index}>
                                        {ingredient || ""}
                                    </li>
                                ))
                            ) : (
                                <li>No ingredients listed.</li>
                            )}
                        </ul>
                        <h2>Instructions:</h2>
                        <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                            {recipe.Directions && recipe.Directions.length > 0 ? (
                                recipe.Directions.map((step, index) => (
                                    <li key={index}>{step}</li>
                                ))
                            ) : (
                                <li>No instructions provided.</li>
                            )}
                        </ul>
                        <h3>Nutrition Facts</h3>
                        <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                            <li>Servings: {recipe.Servings}</li>
                            <li>Calories: {recipe.Calories}</li>
                            <li>Protein: {recipe.Protein}</li>
                            <li>Fat: {recipe.Fat}</li>
                            <li>Carbs: {recipe.Carbs}</li>
                        </ul>
                    </div>
                </>
            )}

            {/* handy links on the bottom left so navigation stays easy */}
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
            </div>
        </div>
    );
}

