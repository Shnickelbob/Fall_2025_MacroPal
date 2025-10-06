/** 
 * this model creates a food with six attributes (name, calories, protein, fat, carbs, and tags)
 * 
 * @author Brian Schaeffer
 * @version October 4, 2025
*/

import mongoose from "mongoose"; // uses mongoose to build the schema and model

const foodSchema = new mongoose.Schema({ // creates the food schema

    Name: {
        type: String,
        required: true, // every food must have a name
        unique: true, // no two food names can be the same
        trim: true, // trims extra spaces off the name
        minlength: 2, // food names must contain at least 2 letters (I would've made it 3 but technically Ox is valid and so are abbreviations like PB for peanut butter)
        maxlength: 120
    },

    Calories: {
        type: Number,
        required: true,
        min: 0,
        max: 5000,
        validate: { // the spec docs indicated using integers so this enforces that
            validator: Number.isInteger,
            message: "{VALUE} must be an integer"
        }
    },

    Protein: {
        type: Number,
        default: 0,
        min: 0,
        max: 5000,
        validate: {
            validator: Number.isInteger,
            message: "{VALUE} must be an integer"
        }
    },

    Fat: {
        type: Number,
        default: 0,
        min: 0,
        max: 5000,
        validate: {
            validator: Number.isInteger,
            message: "{VALUE} must be an integer"
        }
    },

    Carbs: {
        type: Number,
        default: 0,
        min: 0,
        max: 5000,
        validate: {
            validator: Number.isInteger,
            message: "{VALUE} must be an integer"
        }
    },

    Tags: [{ // for categorizing or searching for food
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 30
    }],

});

const Food = mongoose.model("Food", foodSchema); // makes a Food model
export default Food; // lets other files use the food model
