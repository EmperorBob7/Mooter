const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("./schemas/user.js");

async function authenticateUser(username, password, done) {
    username = username.toLowerCase();
    const user = await User.findOne({ name: username });
    if (user == null) {
        return done(null, false, { message: "No user with that name.", status: 400 });
    }

    if (bcrypt.compareSync(password, user.password)) {
        return done(null, user, { message: "Success", status: 200 });
    } else {
        return done(null, false, { message: "Password incorrect", status: 400 });
    }
}

function initialize(passport) {
    passport.use(new LocalStrategy({ usernameField: "username", passwordField: "password" }, authenticateUser));
    passport.serializeUser((user, done) => {
        return done(null, user._id);
    });
    passport.deserializeUser(async (id, done) => {
        const user = await User.findById(id);
        return done(null, user);
    });
}

async function checkUnauthenticated(req, res, next) {
    if (req.user && req.user._id) {
        return next();
    }
    res.redirect("/login.html");
}

module.exports.checkUnauthenticated = checkUnauthenticated;
module.exports.initialize = initialize;