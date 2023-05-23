require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("./schemas/user.js");
// const PORT = 3030;
const app = express();
const SALT_ROUNDS = 10;

app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true })) // for form data
mongoose.set("strictQuery", false);

async function connectToDB() {
    try {
        await mongoose.connect(`mongodb+srv://emperorbob:${process.env.PASSWORD}@cluster0.d100l.mongodb.net/myDB?retryWrites=true&w=majority`);
        console.log("connected");
    } catch (e) {
        console.log(e.message);
    }
}

app.get("/users", async (req, res) => {
    let out = await User.find({});
    out = out.map(user => [user.name, user._id]);
    res.json(out);
});

app.post("/register", async (req, res) => {
    const inputs = req.body;
    console.log(inputs);
    if (!inputs.username || !inputs.password) {
        res.send({ msg: "Failed - Something went wrong.", status: 403 });
        return;
    }
    if (inputs.password.length < 5) {
        res.send({ msg: "Failed - Password must be at least 5 characters.", status: 403 });
        return;
    }

    inputs.username = inputs.username.toLowerCase();
    let nameAlreadyUsed = await User.findOne({ name: inputs.username });
    if (nameAlreadyUsed !== null) {
        res.send({ msg: "Failed - Name Taken", status: 503 });
        return;
    }

    const hash = bcrypt.hashSync(inputs.password, SALT_ROUNDS);
    User.insertMany({
        name: inputs.username,
        password: hash
    });
    res.send({ msg: "Success", status: 200 });
});

app.post("/login", async (req, res) => {
    const inputs = req.body;
    console.log(inputs);
    if (!inputs.username || !inputs.password) {
        res.send({ msg: "Failed - Something went wrong.", status: 403 });
        return;
    }

    inputs.username = inputs.username.toLowerCase();
    const hash = bcrypt.hashSync(inputs.password, SALT_ROUNDS);
    console.log(hash);

    let foundAccount = await User.findOne({ name: inputs.username});
    console.log(bcrypt.compareSync(inputs.password, foundAccount.password));
    if (bcrypt.compareSync(inputs.password, foundAccount.password)) {
        res.send({ msg: "Success", status: 200 });
        return;
    }
    res.send({ msg: "Failure, Password was incorrect", status: 200 });
});

app.get("/shutdown", async (req, res) => {
    await mongoose.disconnect();
});

app.listen(process.env.PORT, async () => {
    await connectToDB();
    console.log(`Listening at http://localhost:${process.env.PORT}`);
});