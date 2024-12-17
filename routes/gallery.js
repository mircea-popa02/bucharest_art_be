// routes/gallery.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Gallery = require('../models/gallery');

// Load locations from JSON file and insert them into MongoDB on server startup
(async () => {
    try {
        const dataPath = path.join(__dirname, '..', 'locations.json');
        const fileContent = fs.readFileSync(dataPath, 'utf8');
        const locations = JSON.parse(fileContent);

        // Optionally clear existing data before inserting new ones
        await Gallery.deleteMany({});
        await Gallery.insertMany(locations);
        console.log('Locations successfully inserted into MongoDB');
    } catch (error) {
        console.error('Error inserting locations into MongoDB:', error);
    }
})();

// Example routes for galleries
router.get('/', async (req, res) => {
    try {
        const galleries = await Gallery.find({});
        res.json(galleries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching galleries' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const gallery = await Gallery.findById(req.params.id);
        if (!gallery) {
            return res.status(404).json({ error: 'Gallery not found' });
        }
        res.json(gallery);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching gallery' });
    }
});

router.post('/', async (req, res) => {
    try {
        const gallery = new Gallery(req.body);
        await gallery.save();
        res.status(201).json(gallery);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error creating gallery' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedGallery = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedGallery) {
            return res.status(404).json({ error: 'Gallery not found' });
        }
        res.json(updatedGallery);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error updating gallery' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedGallery = await Gallery.findByIdAndDelete(req.params.id);
        if (!deletedGallery) {
            return res.status(404).json({ error: 'Gallery not found' });
        }
        res.json({ message: 'Gallery deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting gallery' });
    }
});

module.exports = router;
