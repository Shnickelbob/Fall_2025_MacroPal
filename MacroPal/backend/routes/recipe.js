import express from "express";
import LogEntry from "../models/LogEntry.js";
import Recipe from "../models/recipe.js";
import dateKey from "../utils/dateKey.js";


const router = express.Router();

const getUserId = (req) =>
  req.session?.userId ||
  req.get("x-user-id") ||
  req.headers["x-user-id"] ||
  null;


router.get("/", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Not logged in" });

   const recipes = await Recipe.find().lean();

    res.json({ recipes });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}
);


router.get("/:id", async (req, res) => {
  try {
    // const userId = getUserId(req);
    // if (!userId) return res.status(401).json({ error: "Not logged in" });
    // populate("Ingredients_Ids").
   const recipe = await Recipe.findById(req.params.id).lean();
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json({ recipe });
    }

    catch (e) {
    res.status(400).json({ error: e.message });
    }
}
);



export default router;
