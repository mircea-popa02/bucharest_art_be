const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    date: { type: Date, required: true },
    user: { type: String, required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }
});

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;