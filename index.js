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

async function getName(res, id) {
    if (!nameMap[id]) {
        let user = await User.findById(id);
        if (!user) {
            return res.status(403).json({ msg: "Failed - Invalid ID" });
        }
        nameMap[id] = user.name;
    }
    return res.json({ name: nameMap[id] });
}

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

app.get("/moos", async (req, res) => {
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
    out = out.map(user => [user.name, user._id]);
    res.json(out);
});

app.post("/register", async (req, res) => {
    const inputs = req.body;
    if (!inputs || !inputs.username || !inputs.password) {
        return res.status(403).json({ msg: "Failed - Something went wrong" });
    }
    if (inputs.password.length < 5) {
        return res.status(403).json({ msg: "Failed - Password must be at least 5 characters." });
    }
    if (inputs.username.length < 3 || inputs.username.length > 15) {
        return res.status(403).json({ msg: "Failed - Username must be at least 3 characters and less than 16." });
    }

    if (filter.isProfane(inputs.username)) {
        return res.status(403).json({ msg: "Failed - Username is profane." });
    }

    inputs.username = inputs.username.toLowerCase();
    let nameAlreadyUsed = await User.findOne({ name: inputs.username });
    if (nameAlreadyUsed !== null) {
        return res.status(503).json({ msg: "Failed - Name Taken", status: 503 });
    }

    const hash = bcrypt.hashSync(inputs.password, SALT_ROUNDS);
    User.insertMany({
        name: inputs.username,
        password: hash
    });
    res.redirect("/login.html");
});

app.post("/login", checkAuthenticated, (req, res) => {
    passport.authenticate('local', { session: true }, function (err, user, info) {
        if (!user) {
            console.log("Failure");
            return res.json(info);
        }
        req.logIn(user, function (err) {
            if (err) { throw err; }
            // session saved
            res.json(info);
        });
    })(req, res);
});

/* AUTHENTICATION */

async function checkAuthenticated(req, res, next) {
    if (req.user && req.user._id) {
        const user = await User.findById(req.user._id);
        if (user)
            return res.redirect("/moo.html");
    }
    next();
}

async function checkUnauthenticated(req, res, next) {
    if (req.user && req.user._id) {
        const user = await User.findById(req.user._id);
        if (user)
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
});

app.listen(PORT, async () => {
    console.log(`Listening at http://localhost:${process.env.PORT}`);
});