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

        User.insertMany({
            name: "bob",
            password: "deez"
        });

        console.log(await User.findOne({name: "bob"}));
        console.log(await User.findOne({name: "jeff"}));

        await mongoose.disconnect();

        // const bob = new Player({
        //     name: "joe",
        //     currency: 1985
        // });
        // Player.insertMany({
        //     name: "ligma",
        //     currency: 100
        // });

        // let result = await Player.findOne({name: "bob", currency: 2500});
        // await result.updateOne({currency: 3000});
        // await result.save();

        // await bob.save();
    } catch (e) {
        console.log(e.message);
    }
}

connectToDB();