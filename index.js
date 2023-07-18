require("dotenv").config();
const express = require("express");
const session = require('express-session');
const rateLimit = require('express-rate-limit').rateLimit;

// Content Filter
const Filter = require("bad-words");
const filter = new Filter({ placeHolder: "*" });
module.exports.filter = filter;
module.exports.addName = addName;

// Authentication
const mongoose = require("mongoose");
const MongoStore = require('connect-mongo');
const passport = require("passport");

// Personal Files
const User = require("./schemas/user.js");
const Moo = require("./schemas/moo.js");
const auth = require("./routing/auth.js");
const followingRoute = require("./routing/following.js");
const app = express();

const passportConfig = require("./passport-config.js");
const checkUnauthenticated = passportConfig.checkUnauthenticated;
passportConfig.initialize(passport); // Initialize Passport

const PORT = process.env.PORT || 3030;
let nameMap = {};

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
app.use(rateLimit({
    windowMs: 5 * 1000, // 5 Seconds
    max: 60,
    standardHeaders: true
}));
mongoose.set("strictQuery", false);

/* Routing */

app.use("/auth", auth); // Routing
app.use("/followInfo", followingRoute); // Routing

app.get("/", (req, res) => {
    res.redirect("./register.html");
});

app.get("/getID", checkUnauthenticated, (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(403).json({ msg: "Failed - Something went wrong." });
    }
    return res.json({ id: req.user._id });
});

app.get("/getName", checkUnauthenticated, (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(403).json({ msg: "Failed - Something went wrong." });
    }
    return res.json({ name: req.user.name });
});

app.get("/getName/:id", (req, res) => {
    if (!req.params || req.params.id == null || !mongoose.isValidObjectId(req.params.id)) {
        return res.status(403).json({ msg: "Failed - Invalid ID" });
    }
    getName(res, req.params.id);
});

app.get("/getAllNames", (req, res) => {
    res.json(nameMap);
});

app.get("/moos/:id", async (req, res) => {
    if (!req.params.id || !mongoose.isValidObjectId(req.params.id)) {
        return res.status(403).json({ msg: "Failed - Invalid ID" });
    }
    res.json(await Moo.find({ poster: req.params.id }));
});

// Get moos of people one is following
app.get("/moos", checkUnauthenticated, async (req, res) => {
    let following = (await User.findById(req.user._id)).following;
    let retArr = [await Moo.findById("64a97ec9439c0ebb0c8d5684")]; // ADMIN MOO
    for (let userID of following) {
        let moos = await Moo.find({ poster: userID });
        retArr = retArr.concat(moos);
    }
    res.json(retArr);
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
    return res.status(200).json({ msg: "Success" });
});

app.get("/users", async (req, res) => {
    // let filter = req.params.filter;
    let out = await User.find({});
    out = out.map(user => [user.name, user._id, user.description]);
    res.json(out);
});

app.get("/checkLoggedIn", checkUnauthenticated, (req, res) => {
    res.json({ msg: "Logged In" });
});

/* Cache */

async function populateNameMap() {
    let users = await User.find({});
    for (let user of users) {
        if (nameMap[user._id]) {
            continue;
        }
        addName(user.name, user._id, user.description);
    }
}

async function getName(res, id) {
    if (!nameMap[id]) {
        let user = await User.findById(id);
        if (!user) {
            return res.status(403).json({ msg: "Failed - Invalid ID" });
        }
        nameMap[id] = user.name;
    }
    return res.json({ name: nameMap[id].name });
}

function addName(name, id, desc) {
    nameMap[id] = { name: name, description: desc };
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