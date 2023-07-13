const mongoose = require("mongoose");
const express = require("express");

const router = express.Router();
const User = require("../schemas/user.js");
const checkUnauthenticated = require("../passport-config.js").checkUnauthenticated;

router.get("/isFollowing/:id", checkUnauthenticated, async (req, res) => {
    if (!req.params || !req.params.id || !mongoose.isValidObjectId(req.params.id)) {
        return res.status(403).json({ msg: "Failed - Invalid ID" });
    }
    let userID = req.params.id;
    let user = await User.findById(req.user._id);
    let following = user.following;
    if (following.includes(userID)) {
        return res.json({ msg: "Following", following: true });
    }
    return res.json({ msg: "Not Following", following: false });
});

router.get("/follow/:id", checkUnauthenticated, async (req, res) => {
    if (!req.params || !req.params.id || !mongoose.isValidObjectId(req.params.id)) {
        return res.status(403).json({ msg: "Failed - Invalid ID" });
    }
    let userToFollow = req.params.id;
    let userFollowing = req.user._id;
    let otherUser = await User.findById(userToFollow);
    if (!otherUser) {
        return res.status(200).json({ msg: "Invalid User ID", success: false });
    }

    let user = await User.findById(userFollowing);
    if (!user.following.includes(userToFollow)) {
        user.following.push(userToFollow);
        await user.save();
    }

    if (!otherUser.followed.includes(userFollowing)) {
        otherUser.followed.push(userFollowing);
        await otherUser.save();
    }
    res.json({ msg: "Success", success: true });
});

router.get("/getFollowing", checkUnauthenticated, async (req, res) => {
    let user = await User.findById(req.user._id);
    let retArr = user.following.map(async (f) => {
        let other = await User.findById(f);
        return [other.name, other._id, other.description];
    });
    retArr = await Promise.all(retArr);
    res.json(retArr);
});

router.get("/getFollowers", checkUnauthenticated, async (req, res) => {
    let user = await User.findById(req.user._id);
    let retArr = user.followed.map(async (f) => {
        let other = await User.findById(f);
        return [other.name, other._id, other.description];
    });
    retArr = await Promise.all(retArr);
    res.json(retArr);
});

module.exports = router;