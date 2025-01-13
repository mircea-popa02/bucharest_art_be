const express = require('express');
const router = express.Router();
const Event = require('../models/event');
const Gallery = require('../models/gallery');

router.get('/', async (req, res) => {
    // Fetch all events with filters, search, and sorting
    try {
        const { galleryId, startDate, endDate, search, sort } = req.query;

        // Build query filters
        const filters = {};

        // Filter by gallery ID if provided
        if (galleryId) {
            filters.gallery = galleryId;
        }

        // Filter by date interval
        if (startDate || endDate) {
            filters.date = {};
            if (startDate) filters.date.$gte = new Date(startDate);
            if (endDate) filters.date.$lte = new Date(endDate);
        }

        // Search by text in name or description
        if (search) {
            filters.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Fetch events with applied filters
        let events = await Event.find(filters);

        // Sort by number of attendees if requested
        if (sort === 'attendees') {
            events = events.map(event => {
                const totalAttendees = event.interestedParticipants.length + event.confirmedParticipants.length;
                return { ...event.toObject(), totalAttendees };
            });

            events.sort((a, b) => b.totalAttendees - a.totalAttendees);
        }

        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching events' });
    }
});


router.get('/:galleryId', async (req, res) => {
    // Find all events for a specific gallery
    try {
        const gallery = await Gallery.findById(req.params.galleryId);
        if (!gallery) {
            return res.status(404).json({ error: 'Gallery not found' });
        }

        const events = await Event.find({ gallery: req.params.galleryId });
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching events' });
    }
});

router.post('/:galleryId', async (req, res) => {
    try {
        console.log(req.body);
        const event = new Event({ ...req.body, gallery: req.params.galleryId });
        await event.save();

        // Update the gallery object to include the new event
        const gallery = await Gallery.findById(req.params.galleryId);
        if (gallery) {
            gallery.events.push(event._id);
            await gallery.save();
        }

        res.status(201).json(event);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error creating event' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(updatedEvent);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error updating event' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting event' });
    }
});

router.patch('/:id/participants', async (req, res) => {
    const { userId, action } = req.body;
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        event.interestedParticipants.pull(userId);
        event.confirmedParticipants.pull(userId);

        if (action === 'interested') {
            event.interestedParticipants.push(userId);
        } else if (action === 'confirmed') {
            event.confirmedParticipants.push(userId);
        } else {
            return res.status(400).json({ error: 'Invalid action. Use "interested" or "confirmed".' });
        }

        await event.save();
        res.json(event);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error updating participants' });
    }
});

module.exports = router;


module.exports = router;
