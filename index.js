require("dotenv").config();
const express = require("express");
const session = require('express-session');
const Filter = require("bad-words");
const filter = new Filter({ placeHolder: "*" });

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const MongoStore = require('connect-mongo');
const passport = require("passport");

const User = require("./schemas/user.js");
const Moo = require("./schemas/moo.js");
const auth = require("./auth/auth.js");
const app = express();
require("./passport-config.js")(passport); // Initialize Passport

const PORT = process.env.PORT || 3030;
const SALT_ROUNDS = 10;
let currentMoos = [], newMoo = true, nameMap = {};

app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true })); // for form data
app.use(session({
    secret: process.env.SESSION_HASH,
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 3600000 // 1 hour
    },
    store: MongoStore.create({ client: connectToDB().then(() => mongoose.connection.getClient()) })
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.set("strictQuery", false);

app.use("/auth", auth); // Routing

app.get("/getName", checkUnauthenticated, (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(403).json({ msg: "Failed - Something went wrong." });
    }
    getName(res, req.user._id);
});

app.get("/getName/:id", (req, res) => {
    console.log(req.params);
    if (!req.params.id) {
        return res.status(403).json({ msg: "Failed - Invalid ID" });
    }
    getName(res, req.params.id);
});

app.get("/getAllNames", (req, res) => {
    res.json(nameMap);
});

app.get("/moos/:id", async (req, res) => {
    if (!req.params.id) {
        return res.status(403).json({ msg: "Failed - Invalid ID" });
    }
    res.json(await Moo.find({ poster: req.params.id }));
});

app.get("/moos", checkUnauthenticated, async (req, res) => {
    if (newMoo) {
        newMoo = false;
        currentMoos = await Moo.find({});
    }
    res.json(currentMoos);
});

app.post("/moo", checkUnauthenticated, async (req, res) => {
    if (!req.user || !req.user._id || !req.body || !req.body.description) {
        return res.status(403).json({ msg: "Failed - Something went wrong." });
    }
    let user = await User.findById(req.user._id);
    if (!user) {
        return res.status(403).json({ msg: "Invalid Credentials" });
    }
    if (req.body.description.length > 250) {
        return res.status(403).json({ msg: "250 Character Limit" });
    }
    await Moo.insertMany({
        poster: user._id,
        description: filter.clean(req.body.description),
        date: Date.now()
    });
    newMoo = true;
    return res.status(200).json({ msg: "Success" });
});

app.get("/users", async (req, res) => {
    let out = await User.find({});
    out = out.map(user => [user.name, user._id, user.description]);
    res.json(out);
});

/* Cache */

async function populateNameMap() {
    let users = await User.find({});
    for (let user of users) {
        if (nameMap[user._id]) {
            continue;
        }
        nameMap[user._id] = { name: user.name, description: user.description };
        console.log(user.name + " added to Cache.");
    }
}

async function getName(res, id) {
    if (!nameMap[id]) {
        console.log("Accessing DB for Name");
        let user = await User.findById(id);
        if (!user) {
            return res.status(403).json({ msg: "Failed - Invalid ID" });
        }
        nameMap[id] = user.name;
    }
    return res.json({ name: nameMap[id].name });
}

/* AUTHENTICATION */

async function checkUnauthenticated(req, res, next) {
    if (req.user && req.user._id) {
        // const user = await User.findById(req.user._id);
        // if (user)
        return next();
    }
    res.redirect("/login.html");
}

/* DATABASE + PORT BELOW */

async function connectToDB() {
    try {
        let x = await mongoose.connect(`mongodb+srv://emperorbob:${process.env.PASSWORD}@cluster0.d100l.mongodb.net/myDB?retryWrites=true&w=majority`);
        console.log("connected");
    } catch (e) {
        console.log(e.message);
    }
}

app.get("/shutdown", async (req, res) => {
    if (!req.user || !req.user.name || req.user.name != "bob") {
        return res.json({ msg: "No permission for this action" });
    }
    await mongoose.disconnect();
    res.json({ msg: "Success" });
    process.exit(1);
});

app.listen(PORT, async () => {
    populateNameMap();
    console.log(`Listening at http://localhost:${process.env.PORT}`);
});