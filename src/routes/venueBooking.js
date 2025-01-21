const express = require('express');
const router = express.Router();
const VenueBooking = require('../models/VenueBooking');
const auth = require('../middleware/auth');

// Get all bookings (CGPU only)
router.get('/', auth, async (req, res) => {
    try {
        if (!req.organization.isVenueManager) {
            return res.status(403).json({ message: 'Only CGPU can view all bookings' });
        }

        const bookings = await VenueBooking.find()
            .populate('venue')
            .populate('event');
            
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Check venue availability
router.get('/check-availability/:venueId', auth, async (req, res) => {
    try {
        const { date } = req.query;
        const bookings = await VenueBooking.find({
            venue: req.params.venueId,
            startDateTime: {
                $lte: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
            },
            endDateTime: {
                $gte: date
            },
            status: { $in: ['temporary', 'confirmed'] }
        });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;