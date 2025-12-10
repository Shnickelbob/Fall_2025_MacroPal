/** 
 * This model stores per-user, per-day logged foods with macro totals.
 * Used to build the user's daily log and progress toward goals.
 * 
 * @author Joseph Allen
 * @contributors 
 * @version October 19, 2025
 */

import mongoose from "mongoose";

const logEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    dateKey: { type: String, required: true, index: true }, // 'YYYY-MM-DD' (EST)
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
    name: String,
    cal: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    qty: { type: Number, default: 1 },
    servings: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// helpful compound index: fast lookups by user + day
logEntrySchema.index({ userId: 1, dateKey: 1 });

const LogEntry = mongoose.model("LogEntry", logEntrySchema);
export default LogEntry;
