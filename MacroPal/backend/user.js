import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
const { Schema, model } = mongoose;

const userSchema = new Schema({
    username: String,
    password: String
});
const User = model("User", userSchema);
const registerNewUser = async (user, pass) => {
    if(await User.findOne({username: user})){
        return false;
    }
    else{
        const newUser = new User({username: user, password: pass});
        await newUser.save();
        return true;
    }
}
const verifyLogin = async (user, pass) => {
    if(await User.findOne({username: user, password: pass})){
        return true;
    }
    else{
        return false;
    }
}

export { registerNewUser, verifyLogin };