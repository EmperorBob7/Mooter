require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("./schemas/user.js");
const PORT = 3030;
const app = express();
const SALT_ROUNDS = 10;

app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));
mongoose.set("strictQuery", false);

async function connectToDB(arg) {
    try {
        await mongoose.connect(`mongodb+srv://emperorbob:${process.env.PASSWORD}@cluster0.d100l.mongodb.net/myDB?retryWrites=true&w=majority`);
        console.log("connected");
        console.log(await User.findById((arg)));
        // await User.updateMany({}, {following: [], followed: []});
        // let user = await User.findById("6493800501f3d23ae4735bbb");
        // user.following.push("6493df8cd01b6317b7add092");
        // user.save();
        console.log("DONE");
    } catch (e) {
        console.log(e.message);
    }
}

connectToDB('null');