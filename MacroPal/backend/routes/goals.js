/**
 * Lets users search for foods by name or tags.
 * Returns basic info like calories, protein, fat, and carbs.
 *
 * @author Emily Howell
 * @version October 16, 2025
*/

import express from "express";
import User from "../user.js";

const router = express.Router();

// Obviously need to wrap some stuff in try/catch blocks

// User route
app.post("/api/goals", async (req, res) => {
    // testing with an existing user (me)
    await db.collection('users').updateOne(
        { username: 'emmer' },
        {
            $set: { 'Goal_Cals': req.body.Calorie,
                'Goal_Protein': req.body.Protein,
                'Goal_Fat': req.body.Fat,
                'Goal_Carbs': req.body.Carbs,
            },
            $currentDate: { lastModified: true }
        }
);
  });

export default router;