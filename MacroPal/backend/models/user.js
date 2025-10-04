/** 
 * This model creates a user with four attributes (email, screen name, password, and logS id)
 * 
 * @author Brian Schaeffer
 * @version October 4, 2025
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
        minlength: 2,
        maxlength: 40,
        match: /^[A-Za-z0-9_.-]+$/, // alphanumeric screen name that allows underscores, periods, and hyphens
    },

    Password: {
        type: String,
        required: true,
    },

    Logs_Ids: [
        {
            type: mongoose.Schema.Types.ObjectId, // ObjectId points to the Log
            ref: "Log", // linker
        },
    ],

});

const User = mongoose.model("User", userSchema); // creates a model called "User"
export default User; // allows other files to use a User model
