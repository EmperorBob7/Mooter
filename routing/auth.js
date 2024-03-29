const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");

const router = express.Router();
const User = require("../schemas/user.js");
const filter = require("../index.js").filter;
const addName = require("../index.js").addName;
const SALT_ROUNDS = 10;

router.get("/logout", async (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                res.status(400).json({ msg: err });
            } else {
                req.session = null;
                res.redirect("../login.html");
            }
        });
    } else {
        res.status(400).json({ msg: "No session found" })
    }
});

router.post("/register", async (req, res) => {
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
    await User.insertMany({
        name: inputs.username,
        password: hash,
        description: "T.B.D.",
        following: [],
        followed: []
    });

    let user = await User.find({ name: inputs.username });
    addName(user.name, user._id, user.description);
    res.redirect("/login.html");
});

router.post("/login", checkAuthenticated, (req, res) => {
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

async function checkAuthenticated(req, res, next) {
    if (req.user && req.user._id) {
        return res.redirect("/moo.html");
    }
    next();
}

module.exports = router;