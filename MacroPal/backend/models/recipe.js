/** 
 * This model creates a recipe with three attributes (name, ingredient ids, and creator id)
 * 
 * @author Brian Schaeffer
 * @version October 4, 2025
*/

import mongoose from "mongoose"; // uses mongoose to build the schema and model

const recipeSchema = new mongoose.Schema({ // creates the schema for a recipe

    Name: {
        type: String,
        required: true, // every recipe must have a name
        unique: true, // no two recipes should share the same name
        trim: true, // trailing and leading whitespaces are removed
        maxlength: 80 // puts a limit on how long the recipe name can be
    },

    Ingredients_Ids: [{ // stores all of the foods that make up this recipe
        type: mongoose.Schema.Types.ObjectId, // ObjectId points to Food docs
        ref: "Food", // linker
    }],

    Creator_Id: {
        type: mongoose.Schema.Types.ObjectId, // ObjectId points to a User doc
        ref: "User", // linker
    },

});

const Recipe = mongoose.model("Recipe", recipeSchema); // makes a recipe model
export default Recipe; // allows other files to use the recipe model
