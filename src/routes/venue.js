const express = require('express');
const router = express.Router();
const Venue = require('../models/Venue');
const auth = require('../middleware/auth');

// Create a new venue (CGPU only)
router.post('/', auth, async (req, res) => {
    try {
        // Check if the organization is CGPU
        if (!req.organization.isVenueManager) {
            return res.status(403).json({ message: 'Only CGPU can manage venues' });
        }

        const { name, capacity, features } = req.body;

        const venue = new Venue({
            name,
            capacity,
            features
        });

        await venue.save();
        res.status(201).json(venue);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all venues
router.get('/', auth, async (req, res) => {
    try {
        const venues = await Venue.find();
        res.json(venues);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get venue by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const venue = await Venue.findById(req.params.id);
        if (!venue) {
            return res.status(404).json({ message: 'Venue not found' });
        }
        res.json(venue);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update venue (CGPU only)
router.put('/:id', auth, async (req, res) => {
    try {
        if (!req.organization.isVenueManager) {
            return res.status(403).json({ message: 'Only CGPU can manage venues' });
        }

        const venue = await Venue.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!venue) {
            return res.status(404).json({ message: 'Venue not found' });
        }

        res.json(venue);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;