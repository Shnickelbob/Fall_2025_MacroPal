// backend/index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import * as user from "./user.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI;

// --- Middleware
app.use(cors());
app.use(express.json());

// --- Simple route
app.get("/api/health", async (req, res) => {
  try {
    // run a lightweight ping
    await mongoose.connection.db.admin().ping();
    res.json({ status: "ok", db: "connected", time: new Date().toISOString() });
  } catch (err) {
    console.error("DB ping failed:", err.message);
    res.status(500).json({ status: "error", db: "not connected" });
  }
});


app.post("/api/register", async (req, res) => {
  try{
  const {username, password} = req.body;
  if(await user.registerNewUser(username, password)){
    return res.send(`User ${username} registered`);
  }
  else{
    return res.send("Username already exists");
  }}
  catch(err){
    console.error("Error in /api/register:", err);
    res.status(500).send("Internal server error");
  }
});

app.post("/api/login", async (req, res) => {
  try{
  const {username, password} = req.body;
  const result = await user.verifyLogin(username, password);
  if(result){
    return res.send("Login Successful");
  }
  else{
    console.log("test");
    return res.send("Incorrect username or password");
  }}
  catch(err){
    console.error("Error in /api/login:", err);
    res.status(500).send("Internal server error");
  }
});


// --- Connect to Mongo and start server
async function start() {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGODB_URI missing in .env");
    }

    await mongoose.connect(MONGO_URI, {
      dbName: process.env.DB_NAME || undefined,
    });

    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`MacroPal backend running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
}

start();
