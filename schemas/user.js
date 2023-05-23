const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: String,
    password: String
});

module.exports = mongoose.model('User', playerSchema);