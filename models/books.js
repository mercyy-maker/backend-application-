const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let BookSchema = new Schema({
    bookName: String,
    authorName: String,
    isbn: String,
    bookPrice: Number,
});

module.exports = mongoose.model('Books', BookSchema);

