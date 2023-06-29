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

async function connectToDB() {
    try {
        await mongoose.connect(`mongodb+srv://emperorbob:${process.env.PASSWORD}@cluster0.d100l.mongodb.net/myDB?retryWrites=true&w=majority`);
        console.log("connected");

        await User.updateMany({}, { description: "T.B.D." });
        console.log("DONE");
    } catch (e) {
        console.log(e.message);
    }
}

connectToDB();