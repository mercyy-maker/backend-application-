const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let BookSchema = new Schema({
    title: String,
    description: String,
    year: Number,
    author: String,
    price: Number,
});

module.exports = mongoose.model('Book', BookSchema);

