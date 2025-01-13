const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String },
    gallery: { type: mongoose.Schema.Types.ObjectId, ref: 'Gallery' },
    interestedParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    confirmedParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
