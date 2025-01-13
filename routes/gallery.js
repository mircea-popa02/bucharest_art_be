const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Gallery = require('../models/gallery');

(async () => {
    try {
        const galleryCount = await Gallery.countDocuments({});
        if (galleryCount === 0) {
            const dataPath = path.join(__dirname, '..', 'locations.json');
            const fileContent = fs.readFileSync(dataPath, 'utf8');
            const locations = JSON.parse(fileContent);

            await Gallery.insertMany(locations);
            console.log('Locations successfully inserted into MongoDB');
        } else {
            console.log('Galleries collection is not empty, skipping insertion');
        }
    } catch (error) {
        console.error('Error inserting locations into MongoDB:', error);
    }
})();

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
