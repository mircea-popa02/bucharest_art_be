const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    name: { type: String, required: true },
    coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    type: { type: String, required: true },
    description: { type: String },
    website: { type: String },
    address: { type: String },
    contact_email: { type: String },
    phone: { type: String },
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]
});

const Gallery = mongoose.model('Gallery', gallerySchema);
module.exports = Gallery;
