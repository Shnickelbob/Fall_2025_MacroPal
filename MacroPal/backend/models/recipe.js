/** 
 *  This model creates a recipe with three attributes (name, ingredient ids, and creator id)
 * 
 * @author Brian Schaeffer
 * @version October 11, 2025
*/

import mongoose from "mongoose"; // uses mongoose to build the schema and model

const recipeSchema = new mongoose.Schema({ // creates the schema for a recipe

    Name: {
        type: String,
        required: true, // every recipe must have a name
        // unique: true, // no two recipes should share the same name
        trim: true, // trailing and leading whitespaces are removed
        maxlength: 80 // puts a limit on how long the recipe name can be
    },

    // Brief Description of Recipe:
    Description: {
        type: String,
        required: true, // every recipe must have a description
        trim: true, // trailing and leading whitespaces are removed
        maxlength: 500 // limits the length of descriptions
    },

    // Ingredients: A list of ingredients needed -
    // i.e. (1/4 cup diced onions) or (1 lb ground chuck)
    Ingredients: [{ 
        type: String,
        trim: true,
        // lowercase: true,
        maxlength: 50 // tested some sample statements for reasonable length
    }],

    // Directions: a list of the directions for preparing the recipe
    // i.e. "Add the onion to the pot and simmer until transparent"
    Directions: [{ 
        type: String,
        trim: true,
        // lowercase: true,
        maxlength: 400 // tested some sample statements for reasonable length
    }],

    // lets you know how many servings a recipe makes - we'll use for logging purposes
    Servings: {
        type: Number,
        required: true,
        min: 1,
        max: 20, // seems like a reasonable number for now
        validate: { // the spec docs indicated using integers so this enforces that
            validator: Number.isInteger,
            message: "{VALUE} must be an integer"
        }
    },

    // all the shared relevant fields used for foods:
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

    // Ommitting tags for now - maybe integrate later

    // Tags: [{ // for categorizing or searching for recipes
    //     type: String,
    //     trim: true,
    //     lowercase: true,
    //     maxlength: 30
    // }],

    // Optional for later integration: associated a user with a recipe:
    Creator_Id: {
        type: mongoose.Schema.Types.ObjectId, // ObjectId points to a User doc
        ref: "User", // linker
    },



});

// Queries are case-insensitive
recipeSchema.set('collation', { locale: 'en', strength: 2 });

// Ensures Name is case-insensitive
recipeSchema.index({ Name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

const Recipe = mongoose.model("Recipe", recipeSchema); // makes a recipe model
export default Recipe; // allows other files to use the recipe model
