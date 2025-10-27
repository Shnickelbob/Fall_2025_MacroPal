/** 
 *  This model creates a user with four attributes (email, screen name, password, and logS id)
 * 
 * @author Brian Schaeffer
 * @contributors Joseph Allen
 * @version October 19, 2025
*/

import mongoose from "mongoose"; // uses mongoose to build the schema and model

const userSchema = new mongoose.Schema({ // creates a schema for a user

    Email: {
        type: String,
        required: true, // every user must have an email
        unique: true, // ensures that two users aren't using the same email
        trim: true, // trailing or leading whitespaces are removed
        lowercase: true // saves emails in lowercase
    },

    ScreenName: {
        type: String,
        required: true, // every user must have a screen name
        unique: true, // only one user can use the screen name
        trim: true,
        minlength: 8,
        maxlength: 16,
        match: /^[A-Za-z0-9_.-]+$/, // alphanumeric screen name that allows underscores, periods, and hyphens
    },

    Password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 16,
        match: /^[A-Za-z0-9_.-]+$/, // alphanumeric password that allows underscores, periods, and hyphens
    },

    // Logs_Ids: [
    //     {
    //         type: mongoose.Schema.Types.ObjectId, // ObjectId points to the Log
    //         ref: "Log", // linker
    //     },
    // ],

    /* rather than log ids, have each user have 1 log:
    This log will empty out at the beginning of each 24/hr period,
    to be implemented later. For now, just a log to store that user's
    logged food items.
    */
    Log: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "Food", // Linker
        }
    ],

    // List of favorited/saved food items:
    Saved_Foods: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "Food", // Linker
        }
    ],

   // Following: a sequence of attributes for the goal values set by user:
    Goal_Cals: {
        type: Number,
        default: 0,
        min: 0,
        max: 5000,
        validate: {
            validator: Number.isInteger,
            message: "{VALUE} must be an integer"
        }
    },

    Goal_Protein: {
        type: Number,
        default: 0,
        min: 0,
        max: 5000,
        validate: {
            validator: Number.isInteger,
            message: "{VALUE} must be an integer"
        }
    },
   
    Goal_Fat: {
        type: Number,
        default: 0,
        min: 0,
        max: 5000,
        validate: {
            validator: Number.isInteger,
            message: "{VALUE} must be an integer"
        }
    },

    Goal_Carbs: {
        type: Number,
        default: 0,
        min: 0,
        max: 5000,
        validate: {
            validator: Number.isInteger,
            message: "{VALUE} must be an integer"
        }
    },
});

// Make virtuals appear when sending JSON back to the client
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// A convenient virtual that maps your Goal_* fields to a single "goals" object
userSchema.virtual('goals')
  .get(function () {
    return {
      cal: this.Goal_Cals ?? 0,
      protein: this.Goal_Protein ?? 0,
      carbs: this.Goal_Carbs ?? 0,
      fat: this.Goal_Fat ?? 0,
    };
  })
  .set(function (v) {
    if (v == null || typeof v !== 'object') return;
    if (v.cal != null) this.Goal_Cals = v.cal;
    if (v.protein != null) this.Goal_Protein = v.protein;
    if (v.carbs != null) this.Goal_Carbs = v.carbs;
    if (v.fat != null) this.Goal_Fat = v.fat;
  });

// Small helper you can call from routes to update any subset of goals
userSchema.methods.applyGoalPatch = function (patch = {}) {
  if (patch.cal != null) this.Goal_Cals = patch.cal;
  if (patch.protein != null) this.Goal_Protein = patch.protein;
  if (patch.carbs != null) this.Goal_Carbs = patch.carbs;
  if (patch.fat != null) this.Goal_Fat = patch.fat;
  return this;
};

const User = mongoose.models.User || mongoose.model("User", userSchema); // creates a model called "User"
export default User; // allows other files to use a User model
