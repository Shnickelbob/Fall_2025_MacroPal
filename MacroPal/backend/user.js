/** 
 * Temporary auth-only model (username/password)
 * 
 * NOTE:
 * - To avoid colliding with the main "User" schema in models/user.js, we define
 *   an alternate model name "AuthUser" here.
 * - We STILL point to the SAME MongoDB collection ("users") so existing test
 *   users data remain intact.
 * - When real login/sessions are finished, unify on models/user.js and remove this file.
 * 
 * @author 
 * @contributors Joseph Allen
 * @version October 19, 2025
 */

import mongoose from "mongoose"; // only mongoose is needed here
const { Schema, model } = mongoose;

// Minimal auth schema for temporary register/login helpers
const userSchema = new Schema(
  {
    username: String,
    password: String,
  },
  { timestamps: true }
);

//  Use a DIFFERENT model name to avoid overwrite, but SAME collection ("users")
const AuthUser =
  mongoose.models.AuthUser || model("AuthUser", userSchema, "users");

// Register a new user (returns true if created, false if username exists)
export const registerNewUser = async (user, pass) => {
  const exists = await AuthUser.findOne({ username: user }).lean();
  if (exists) return false;

  const doc = new AuthUser({ username: user, password: pass });
  await doc.save();
  return true;
};

// Verify login (very basic — replace with real auth later)
export const verifyLogin = async (user, pass) => {
  const found = await AuthUser.findOne({ username: user, password: pass }).lean();
  return !!found;
};
