/** 
 * This model creates an exercise with four attributes (name, calories burned, creator id, and description)
 * 
 * @author Brian Schaeffer
 * @version October 4, 2025
*/

import mongoose from "mongoose"; // uses mongoose to build the schema and model

const exerciseSchema = new mongoose.Schema({ // creates the exercise schema

    Name: {
        type: String,
        required: true, // every exercise needs a name
        trim: true,
        maxlength: 120
    },

    Cals_Burned: {
        type: Number,
        required: true, // every exercise must record calories burned
        min: 0,
        max: 10000,
        validate: {
            validator: Number.isInteger,
            message: "{VALUE} must be a positive integer"
        }
    },

    Creator_Id: {
        type: mongoose.Schema.Types.ObjectId, // points back to the user who created it
        ref: "User", // linker
    },

    Description: {
        type: String,
        trim: true,
        maxlength: 1000
    },

});

const Exercise = mongoose.model("Exercise", exerciseSchema); // makes a exercise model
export default Exercise; // lets other files use the exercise model
