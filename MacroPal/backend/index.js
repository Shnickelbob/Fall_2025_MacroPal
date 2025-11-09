// backend/index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import session from "express-session";
import MongoStore from "connect-mongo";

import * as user from "./user.js";            // temp auth helpers (register/login)
import searchRouter from "./routes/search.js";
import logRouter from "./routes/log.js";
import userRoutes from "./routes/user.js";
import Food from "./models/food.js";
import Recipe from "./models/recipe.js";
import savedRoutes from "./routes/saved.js";

// ✅ NEW: mount recipes routes
import recipesRoutes from "./routes/recipes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI;

// --- Core middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Optional session support (keeps dev branch happy; your code doesn’t depend on it)
if (MONGO_URI) {
  app.use(
    session({
      name: "mp.sid",
      secret: process.env.SESSION_SECRET || "dev-secret-change-me",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // set true only if serving over HTTPS
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
      store: MongoStore.create({
        mongoUrl: MONGO_URI,
        dbName: process.env.DB_NAME || undefined,
        ttl: 60 * 60 * 24 * 7,
      }),
    })
  );
}

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
  const id = req.header("x-user-id") || req.session?.userId;
  if (!id) return res.status(401).json({ error: "Missing auth (x-user-id or session)" });
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

    if (username.length < 8 || username.length > 16) {
      return res.send(`Username must be between 8-16 characters`);
    }

    if (password.length < 8 || password.length > 16 || password.search(/[!@#$%^&*0-9]/) === -1 || password.search(/[A-Z]/) === -1) {
      return res.send(`Password must be between 8-16 characters, contain an uppercase character, and contain a number or special character`);
    }

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
    const doc = await user.verifyLogin(username, password); // returns user doc or null
    if (!doc) {
      return res.status(401).json({ ok: false, error: "Incorrect username or password" });
    }

    // Support both header-based flow (frontend uses mp_user_id) and session-based future
    const userId = String(doc._id);
    if (req.session) req.session.userId = userId;

    return res.json({
      ok: true,
      userId,
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

// Protected routes (must include x-user-id or session)
app.use("/api/user", requireUser, userRoutes);
app.use("/api/log", requireUser, logRouter);
console.log("[index.js] mounted /api/user and /api/log as protected");

// Saved routes (internal auth check is inside savedRoutes)
app.use("/api/saved", savedRoutes);

// ✅ NEW: Recipes routes (protected)
app.use("/api/recipes", requireUser, recipesRoutes);

// Example food creation (left public as before)
app.post("/api/foods", async (req, res) => {
  try {
    const found = await Food.findOne({ Name: req.body.Name }).collation({ locale: "en", strength: 2 });
    if (found) return res.status(409).json({ error: "Food already exists" });
    const food = await Food.create(req.body);
    res.status(201).json(food);
  } catch (err) {
    console.error("Error in /api/foods:", err.message);
    res.status(400).json({ error: "Invalid data" });
  }
});

// Add recipe creation endpoint
app.post("/api/recipe", async (req, res) => {
  try {
    const found = await Recipe.findOne({ Name: req.body.Name }).collation({ locale: "en", strength: 2 });
    if (found) return res.status(409).json({ error: "Recipe already exists" });
    const recipe = await Recipe.create(req.body);
    res.status(201).json(recipe);
  } catch (err) {
    console.error("Error in /api/recipe:", err.message);
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
