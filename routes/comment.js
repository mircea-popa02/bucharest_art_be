const express = require('express');
const router = express.Router();
const Event = require('../models/event');
const Comment = require('../models/comment');
const User = require('../models/user');
const auth = require('../middleware/auth');

router.get('/:eventId', auth, async (req, res) => {
    try {
        const comments = await Comment.find({ event: req.params.eventId });
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching comments' });
    }
});

// endpoint where users add comments to an event
router.post('/:eventId', auth, async (req, res) => {
    try {
        const user = req.user.name;

        console.log(user);
        const event = await Event.findById(req.params.eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const comment = new Comment({ ...req.body, user: user, event: req.params.eventId });
        await comment.save();
        // update the event object to include the new comment
        event.comments.push(comment._id);
        await event.save();

        // Update the user object to include the new comment
        const userObj = await User.findOne({ name: user });
        userObj.comments.push(comment._id);
        await userObj.save();

        res.status(201).json(comment);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error creating comment' });
    }
});

// Get all comments of an user
router.get('/', auth, async (req, res) => {
    const name = req.user.name;
    try {
        console.log(name);
        const comments = await Comment.find({ user: name });
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching comments' });
    }
});

module.exports = router;
