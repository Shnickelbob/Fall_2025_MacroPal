/** 
 * This model creates a log with five attributes (foods ids, exercises ids, recipes ids, date, and user id)
 * 
 * @author Brian Schaeffer
 * @version October 4, 2025
*/

import mongoose from "mongoose"; // uses mongoose to build the schema and model

const logSchema = new mongoose.Schema({ // creating the log schema

    Foods_Ids: [{ // stores all the foods in the log
        type: mongoose.Schema.Types.ObjectId, // ObjectId points to Food docs
        ref: "Food", // linker
    }],

    Exercises_Ids: [{ // stores all the exercises in the log
        type: mongoose.Schema.Types.ObjectId, // ObjectId points to Exercise docs
        ref: "Exercise", // linker
    }],

    Recipes_Ids: [{ // stores all the recipes in the log
        type: mongoose.Schema.Types.ObjectId, // ObjectId points to Recipe docs
        ref: "Recipe", // linker
    }],

    Date: {
        type: Date,
        required: true,
        default: Date.now,
    },

    User_Id: {
        type: mongoose.Schema.Types.ObjectId, // ObjectId points back to the User who owns the log
        ref: "User", // linker
        required: true, // logs always belong to a user
    },

});

const Log = mongoose.model("Log", logSchema); // makes a Log model
export default Log; // allows other files to use Log models