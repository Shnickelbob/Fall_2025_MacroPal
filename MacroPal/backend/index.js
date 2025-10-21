// backend/index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import * as user from "./user.js";            // temp auth helpers (register/login)
import searchRouter from "./routes/search.js";
import logRouter from "./routes/log.js";
import userRoutes from "./routes/user.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI;

// --- Core middleware
app.use(cors());
app.use(express.json());

// Debug logger so you can see what hits the backend
app.use((req, _res, next) => {
  console.log(`[backend] ${req.method} ${req.originalUrl}`);
  next();
});

/** Require a logged-in user for protected APIs.
 *  Frontend sets localStorage.mp_user_id after login and sends it
 *  as the "x-user-id" header on every request.
 */

function requireUser(req, res, next) {
  const id = req.header("x-user-id");
  if (!id) return res.status(401).json({ error: "Missing x-user-id header" });
  req.user = { id };
  next();
}

// --- Health (public)
app.get("/api/health", async (_req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ status: "ok", db: "connected", time: new Date().toISOString() });
  } catch (err) {
    console.error("DB ping failed:", err.message);
    res.status(500).json({ status: "error", db: "not connected" });
  }
});

// --- Auth (public)
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (await user.registerNewUser(username, password)) {
      return res.send(`User ${username} registered`);
    }
    return res.send("Username already exists");
  } catch (err) {
    console.error("Error in /api/register:", err);
    res.status(500).send("Internal server error");
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const doc = await user.verifyLogin(username, password);
    if (!doc) {
      return res.status(401).json({ ok: false, error: "Incorrect username or password" });
    }
    return res.json({
      ok: true,
      userId: String(doc._id),
      screenName: doc.ScreenName || doc.username || "User",
    });
  } catch (err) {
    console.error("Error in /api/login:", err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// --- Routers
// Public routes
app.use("/api/search", searchRouter);

// Protected routes (must include x-user-id)
app.use("/api/user", requireUser, userRoutes);
app.use("/api/log", requireUser, logRouter);
console.log("[index.js] mounted /api/user and /api/log as protected");

// Example food creation (left public as before)
import Food from "./models/food.js";
app.post("/api/foods", async (req, res) => {
  try {
    const found = await Food.findOne({ Name: req.body.Name })
      .collation({ locale: "en", strength: 2 });
    if (found) return res.status(409).json({ error: "Food already exists" });
    const food = await Food.create(req.body);
    res.status(201).json(food);
  } catch (err) {
    console.error("Error in /api/foods:", err.message);
    res.status(400).json({ error: "Invalid data" });
  }
});

// --- Mongo start
async function start() {
  try {
    if (!MONGO_URI) throw new Error("MONGODB_URI missing in .env");
    await mongoose.connect(MONGO_URI, { dbName: process.env.DB_NAME || undefined });
    console.log("MongoDB connected");
    app.listen(PORT, () =>
      console.log(`MacroPal backend running at http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
}
start();
