// routes/saved.js
import express from "express";
import User from "../models/user.js";

const router = express.Router();

// mirror log.js auth so your Daily Log flow still works
const getUserId = (req) =>
  req.session?.userId ||
  req.get("x-user-id") ||
  req.headers["x-user-id"] ||
  null;

// GET /api/saved -> return populated saved foods and saved recipes
router.get("/", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(userId)
      .populate("Saved_Foods")
      .populate("Saved_Recipes")
      .lean();

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      savedFoods: user.Saved_Foods ?? [],
      savedRecipes: user.Saved_Recipes ?? [],
    });
  } catch (e) {
    console.error("GET /api/saved error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/saved
// Body can be { foodId } OR { recipeId }
router.post("/", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { foodId, recipeId } = req.body || {};
    if (!foodId && !recipeId) {
      return res.status(400).json({ error: "foodId or recipeId required" });
    }

    if (foodId) {
      await User.updateOne({ _id: userId }, { $addToSet: { Saved_Foods: foodId } });
      return res.json({ ok: true, type: "food", liked: true });
    }

    if (recipeId) {
      await User.updateOne({ _id: userId }, { $addToSet: { Saved_Recipes: recipeId } });
      return res.json({ ok: true, type: "recipe", liked: true });
    }
  } catch (e) {
    console.error("POST /api/saved error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/saved/:id?type=food|recipe
router.delete("/:id", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    const { type } = req.query;

    if (!id) return res.status(400).json({ error: "Missing id" });

    if (type === "recipe") {
      await User.updateOne({ _id: userId }, { $pull: { Saved_Recipes: id } });
      return res.status(204).end();
    }

    // default to food
    await User.updateOne({ _id: userId }, { $pull: { Saved_Foods: id } });
    res.status(204).end();
  } catch (e) {
    console.error("DELETE /api/saved/:id error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as default };
