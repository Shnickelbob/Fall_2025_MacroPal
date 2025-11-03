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

// GET /api/saved -> return populated saved foods
router.get("/", async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        const user = await User.findById(userId).populate("Saved_Foods").lean();
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ saved: user.Saved_Foods ?? [] });
    } catch (e) {
        console.error("GET /api/saved error:", e);
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/saved { foodId } -> add (idempotent)
router.post("/", async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { foodId } = req.body || {};
        if (!foodId) return res.status(400).json({ error: "foodId required" });

        await User.updateOne({ _id: userId }, { $addToSet: { Saved_Foods: foodId } });
        res.json({ ok: true, liked: true });
    } catch (e) {
        console.error("POST /api/saved error:", e);
        res.status(500).json({ error: "Internal server error" });
    }
});

// DELETE /api/saved/:foodId -> remove
router.delete("/:foodId", async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        await User.updateOne({ _id: userId }, { $pull: { Saved_Foods: req.params.foodId } });
        res.status(204).end();
    } catch (e) {
        console.error("DELETE /api/saved/:foodId error:", e);
        res.status(500).json({ error: "Internal server error" });
    }
});

export { router as default };