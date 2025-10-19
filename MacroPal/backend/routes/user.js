/** 
 * This route handles user-related endpoints such as retrieving
 * and updating a user's daily goal values.
 * Uses TEST_USER_ID temporarily until login is functional.
 * 
 * @author Joseph Allen
 * @version October 19, 2025
 */

import express from "express";
import User from "../models/user.js";

const router = express.Router();

// temporary fallback until login/session is finished
const TEST_USER_ID = process.env.TEST_USER_ID; 
const getUserId = (req) => req.user?.id || TEST_USER_ID;

// --- GET current user's goal values ---
router.get("/goals", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId)
      return res.status(400).json({ error: "No userId (login not ready and TEST_USER_ID missing)" });

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      goals: {
        cal: user.Goal_Cals ?? 0,
        protein: user.Goal_Protein ?? 0,
        carbs: user.Goal_Carbs ?? 0,
        fat: user.Goal_Fat ?? 0,
      },
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// --- PATCH update one or more goal values ---
router.patch("/goals", async (req, res) => {
  try {
    const userId = req.user?.id || process.env.TEST_USER_ID;
    if (!userId) return res.status(400).json({ error: "No userId (login not ready and TEST_USER_ID missing)" });

    const { cal, protein, carbs, fat } = req.body;

    const $set = {};
    if (cal !== undefined)     $set["Goal_Cals"]    = cal;
    if (protein !== undefined) $set["Goal_Protein"] = protein;
    if (carbs !== undefined)   $set["Goal_Carbs"]   = carbs;
    if (fat !== undefined)     $set["Goal_Fat"]     = fat;

    // update
    const upd = await User.updateOne({ _id: userId }, { $set });
    if (upd.matchedCount === 0 && upd.n === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // read back (source of truth)
    const fresh = await User.findById(userId).lean();
    res.json({
      goals: {
        cal: fresh?.Goal_Cals ?? 0,
        protein: fresh?.Goal_Protein ?? 0,
        carbs: fresh?.Goal_Carbs ?? 0,
        fat: fresh?.Goal_Fat ?? 0,
      },
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});


export default router;
