/**
 * This route handles per-user, per-day food logging:
 *  - POST   /api/log        -> add a food to today's log
 *  - GET    /api/log/today  -> fetch today's entries + totals + goals
 *  - DELETE /api/log/:id    -> remove a logged item
 * 
 * @author Joseph Allen
 * @contributors 
 * @version October 19, 2025
 */

import express from "express";
import LogEntry from "../models/logEntry.js";
import User from "../models/user.js";
import dateKey from "../utils/dateKey.js";

const router = express.Router();

const getUserId = (req) =>
  req.session?.userId ||
  req.get("x-user-id") ||
  req.headers["x-user-id"] ||
  null;

// POST /api/log  -> add a food to today's log
router.post("/", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Not logged in" });

    const key = dateKey();
    const { foodId, name, cal, protein, carbs, fat, qty = 1, servings = 1 } = req.body;

    // Coerce to numbers safely so totals math is reliable
    const toNum = (v) => (v === "" || v == null ? 0 : Number(v));
    const doc = await LogEntry.create({
      userId,
      dateKey: key,
      foodId,
      name,
      cal: toNum(cal),
      protein: toNum(protein),
      carbs: toNum(carbs),
      fat: toNum(fat),
      qty: toNum(qty) || 1,
      servings: toNum(servings) || 1,
    });

    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET /api/log/today -> entries + totals + goals + remaining
router.get("/today", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Not logged in" });

    const key = dateKey();

    const [entries, user] = await Promise.all([
      LogEntry.find({ userId, dateKey: key }).sort({ createdAt: -1 }),
      User.findById(userId).lean(),
    ]);

    const totals = entries.reduce(
      (a, x) => ({
        cal: a.cal + ((Number(x.cal) || 0) * (Number(x.qty) || 1)),
        protein: a.protein + ((Number(x.protein) || 0) * (Number(x.qty) || 1)),
        carbs: a.carbs + ((Number(x.carbs) || 0) * (Number(x.qty) || 1)),
        fat: a.fat + ((Number(x.fat) || 0) * (Number(x.qty) || 1)),
      }),
      { cal: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const goals = {
      cal: Number(user?.Goal_Cals ?? 0),
      protein: Number(user?.Goal_Protein ?? 0),
      carbs: Number(user?.Goal_Carbs ?? 0),
      fat: Number(user?.Goal_Fat ?? 0),
    };

    const remaining = {
      cal: Math.max(goals.cal - totals.cal, 0),
      protein: Math.max(goals.protein - totals.protein, 0),
      carbs: Math.max(goals.carbs - totals.carbs, 0),
      fat: Math.max(goals.fat - totals.fat, 0),
    };

    res.json({ dateKey: key, entries, totals, goals, remaining });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE /api/log/:id -> remove one logged item
router.delete("/:id", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Not logged in" });

    await LogEntry.deleteOne({ _id: req.params.id, userId });
    res.status(204).end();
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
