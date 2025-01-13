const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const user_schema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    interestedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    confirmedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]
})

user_schema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

const User = mongoose.model('User', user_schema)
module.exports = User
