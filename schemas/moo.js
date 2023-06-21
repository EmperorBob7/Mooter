const mongoose = require('mongoose');

const mooSchema = new mongoose.Schema({
    poster: String,
    description: String,
    date: Number
});

module.exports = mongoose.model('Moo', mooSchema);