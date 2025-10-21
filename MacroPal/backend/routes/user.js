/**
 * User routes: read/update daily goal values.
 * Uses TEST_USER_ID or "x-user-id" header until auth is ready.
 *
 * @author Joseph Allen
 * @version October 19, 2025
 */

import express from "express";
import User from "../models/user.js";

const router = express.Router();

function toGoalsPayload(user) {
  return {
    goals: {
      cal: Number(user?.Goal_Cals ?? 0),
      protein: Number(user?.Goal_Protein ?? 0),
      carbs: Number(user?.Goal_Carbs ?? 0),
      fat: Number(user?.Goal_Fat ?? 0),
    },
  };
}

// GET /api/user/goals
router.get("/goals", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json(toGoalsPayload(user));
  } catch (e) {
    console.error("GET /api/user/goals error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/user/goals
router.patch("/goals", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Accept either {cal, protein, carbs, fat} or {goals:{...}}
    const src = req.body?.goals ?? req.body ?? {};
    const toNum = (v) => (v === "" || v == null ? undefined : Number(v));

    const cal = toNum(src.cal);
    const protein = toNum(src.protein);
    const carbs = toNum(src.carbs);
    const fat = toNum(src.fat);

    const $set = {};
    if (cal !== undefined && !Number.isNaN(cal)) $set.Goal_Cals = cal;
    if (protein !== undefined && !Number.isNaN(protein)) $set.Goal_Protein = protein;
    if (carbs !== undefined && !Number.isNaN(carbs)) $set.Goal_Carbs = carbs;
    if (fat !== undefined && !Number.isNaN(fat)) $set.Goal_Fat = fat;

    if (Object.keys($set).length === 0) {
      return res.status(400).json({ error: "No valid goal fields provided" });
    }

    const upd = await User.updateOne({ _id: userId }, { $set });
    const matched = (upd.matchedCount ?? upd.n) || 0;
    if (matched === 0) return res.status(404).json({ error: "User not found" });

    const fresh = await User.findById(userId).lean();
    return res.status(200).json(toGoalsPayload(fresh));
  } catch (e) {
    console.error("PATCH /api/user/goals error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
