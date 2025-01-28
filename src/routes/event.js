const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const VenueBooking = require('../models/VenueBooking');
const Organization = require('../models/Organization');
const auth = require('../middleware/auth');

// Create a new event
router.post('/', auth, async (req, res) => {
    try {
        const {
            name,
            dateTime,
            venue,
            budget,
            description,
            expectedParticipants,
            requiredResources
        } = req.body;

        // Create the event
        const event = new Event({
            name,
            dateTime,
            venue,
            budget,
            description,
            expectedParticipants,
            requiredResources,
            createdBy: req.organization._id
        });

        // Find parent organizations to create approval chain
        let currentOrg = await Organization.findById(req.organization._id);
        const approvalChain = [];

        // Skip the creating organization and start from its parent
        while (currentOrg.parentOrganization) {
            currentOrg = await Organization.findById(currentOrg.parentOrganization);
            approvalChain.push({
                organization: currentOrg._id,
                status: 'pending'
            });
        }

        // Add College (top-level) approval if not already included
        const college = await Organization.findOne({ level: 0 });
        if (!approvalChain.find(a => a.organization.equals(college._id))) {
            approvalChain.push({
                organization: college._id,
                status: 'pending'
            });
        }

        event.approvalChain = approvalChain;

        // Create temporary venue booking
        const venueBooking = new VenueBooking({
            venue: venue,
            event: event._id,
            startDateTime: dateTime,
            endDateTime: new Date(new Date(dateTime).getTime() + 3 * 60 * 60 * 1000), // Default 3 hours duration
            status: 'temporary'
        });

        await event.save();
        await venueBooking.save();

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get events pending approval for an organization
router.get('/pending', auth, async (req, res) => {
    try {
        const events = await Event.find({
            'approvalChain.organization': req.organization._id,
            'approvalChain.status': 'pending',
            status: { $nin: ['cancelled', 'rejected'] }
        }).populate('createdBy venue');
        
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Approve or reject an event
router.put('/:eventId/review', auth, async (req, res) => {
    try {
        const { status, comments } = req.body; // status can be 'approved', 'rejected', or 'needs_modification'
        const event = await Event.findById(req.params.eventId);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Find the current organization's position in approval chain
        const approvalIndex = event.approvalChain.findIndex(
            a => a.organization.equals(req.organization._id)
        );

        if (approvalIndex === -1) {
            return res.status(403).json({ message: 'Not authorized to review this event' });
        }

        // Update the approval status
        event.approvalChain[approvalIndex].status = status;
        event.approvalChain[approvalIndex].comments = comments;
        event.approvalChain[approvalIndex].timestamp = new Date();

        if (status === 'rejected' || status === 'needs_modification') {
            event.status = status;
            // Cancel venue booking if rejected
            if (status === 'rejected') {
                await VenueBooking.findOneAndUpdate(
                    { event: event._id },
                    { status: 'cancelled' }
                );
            }
        } else if (status === 'approved') {
            // Check if this is the last approval needed
            const isFullyApproved = event.approvalChain.every(
                a => a.status === 'approved'
            );

            if (isFullyApproved) {
                event.status = 'approved';
                // Confirm venue booking
                await VenueBooking.findOneAndUpdate(
                    { event: event._id },
                    { status: 'confirmed' }
                );
            }
        }

        await event.save();
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all events created by the organization
router.get('/my-events', auth, async (req, res) => {
    try {
        const events = await Event.find({ createdBy: req.organization._id })
            .populate('venue')
            .populate('approvalChain.organization');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add new route for canceling events in backend
// src/routes/event.js (backend) - Add this new route
router.put('/:eventId/cancel', auth, async (req, res) => {
    try {
      const event = await Event.findById(req.params.eventId);
      
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
  
      if (event.createdBy.toString() !== req.organization._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to cancel this event' });
      }
  
      event.status = 'cancelled';
      await event.save();
  
      // Cancel venue booking
      await VenueBooking.findOneAndUpdate(
        { event: event._id },
        { status: 'cancelled' }
      );
  
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

module.exports = router;