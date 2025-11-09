/**
 * Lets users search for foods by name or tags.
 * Returns basic info like calories, protein, fat, and carbs.
 *
 * @author Brian Schaeffer
 * @version October 11, 2025
*/

import express from "express";
import Food from "../models/food.js";
import Recipe from '../models/recipe.js';

const router = express.Router();

// Handle GET requests to /api/search
router.get("/", async (req, res) => {
    try {
        // Read search settings from the URL
        const { by = "name", userSearch = "", limit = "25", type = "foods" } = req.query;

        // If there’s no search text, send back an empty list
        if (!userSearch || !userSearch.trim()) return res.json([]);

        // Make sure the number of results stays between 1 and 50
        const maxResults = Math.max(1, Math.min(parseInt(limit, 10) || 25, 50));

        // --- NEW: recipes branch (minimal, in-scope) ---
        if (type === "recipes") {
            const namePattern = new RegExp(userSearch, "i"); // case-insensitive search by Name
            const recipeFilter = { Name: { $regex: namePattern } };

            const matchingRecipes = await Recipe.find(recipeFilter)
                .select("Name Servings Calories Protein Fat Carbs")
                .limit(maxResults)
                .lean();

            const recipeResults = matchingRecipes.map(r => ({
                _id: r._id,
                name: r.Name,
                servings: r.Servings,
                calories: r.Calories ?? 0,
                protein: r.Protein ?? 0,
                fat: r.Fat ?? 0,
                carbs: r.Carbs ?? 0,
                tags: [],            // tags not in model yet; placeholder for UI
                type: "recipe"       // critical so UI renders as recipe
            }));

            return res.json(recipeResults);
        }

        // --- foods branch (existing behavior) ---
        let filter = {};

        // Searching by tags (like "fruit" or "protein")
        if (by === "tags") {
            const tagTerms = userSearch.split(",").map(term => term.trim()).filter(Boolean);
            const tagPatterns = tagTerms.length ? tagTerms.map(term => new RegExp(term, "i")) : [new RegExp(userSearch, "i")];
            filter = {
                $or: [
                    { Tags: { $in: tagPatterns } },
                    { tags: { $in: tagPatterns } },
                ],
            };
        }
        // Otherwise, search by the food’s name
        else {
            const namePattern = new RegExp(userSearch, "i");
            filter = {
                $or: [
                    { Name: { $regex: namePattern } },
                    { name: { $regex: namePattern } },
                ],
            };
        }

        // Get matching foods from the database
        const matchingFoods = await Food.find(filter)
            .select("Name name Calories calories Protein protein Fat fat Carbs carbs Tags tags")
            .limit(maxResults)
            .lean();

        // Clean up and organize the data before sending it back
        const results = matchingFoods.map(foodItem => ({
            _id: foodItem._id,
            name: foodItem.Name || foodItem.name,
            calories: foodItem.Calories ?? foodItem.calories ?? 0,
            protein: foodItem.Protein ?? foodItem.protein ?? 0,
            fat: foodItem.Fat ?? foodItem.fat ?? 0,
            carbs: foodItem.Carbs ?? foodItem.carbs ?? 0,
            tags: foodItem.Tags || foodItem.tags || [],
        }));

        // Send the results to the user
        res.json(results);
    } catch (error) {
        // If something goes wrong, log it and tell the user
        console.error("Search error:", error);
        res.status(500).json({ error: "Search failed" });
    }
});

export default router;
