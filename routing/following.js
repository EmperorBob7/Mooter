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
    if (following.includes(userID)) { // Following that User
        return res.json({ msg: "Following", following: true });
    }
    return res.json({ msg: "Not Following", following: false });
});

router.get("/follow/:id", checkUnauthenticated, async (req, res) => {
    if (!req.params || !req.params.id || !mongoose.isValidObjectId(req.params.id)) {
        return res.status(403).json({ msg: "Failed - Invalid ID" });
    }
    let myUserID = req.user._id + "";
    let otherID = req.params.id;
    let otherUser = await User.findById(otherID);
    if (!otherUser) {
        return res.status(200).json({ msg: "Invalid User ID", success: false });
    }

    if (!otherUser.followed.includes(myUserID)) { // Not Followed
        otherUser.followed.push(myUserID); // Update List
        await otherUser.save();
    }

    let user = await User.findById(myUserID);
    if (!user.following.includes(otherID)) { // Not Following
        user.following.push(otherID); // Update List
        await user.save();
    }
    res.json({ msg: "Success", success: true });
});

router.get("/unfollow/:id", checkUnauthenticated, async (req, res) => {
    if (!req.params || !req.params.id || !mongoose.isValidObjectId(req.params.id)) {
        return res.status(403).json({ msg: "Failed - Invalid ID" });
    }
    let myUserID = req.user._id;
    let otherID = req.params.id;
    let otherUser = await User.findById(otherID);
    if (!otherUser) {
        return res.status(200).json({ msg: "Invalid User ID", success: false });
    }

    let userIndex = otherUser.followed.indexOf(myUserID);
    if(userIndex != -1) { // Is Followed
        otherUser.followed.splice(userIndex, 1); // Remove Element
        await otherUser.save();
    }

    let user = await User.findById(myUserID);
    userIndex = user.following.indexOf(otherID);
    if(userIndex != -1) { // Is Following
        user.following.splice(userIndex, 1); // Remove Element
        await user.save();
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