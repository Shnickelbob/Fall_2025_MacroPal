import express from "express";
import Recipe from "../models/recipe.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const rows = await Recipe.find({})
      .select("_id Name Calories Protein Fat Carbs Servings")
      .lean();
    res.json({ recipes: rows || [] });
  } catch (e) {
    console.error("GET /api/recipes error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
