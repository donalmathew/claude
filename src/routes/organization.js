const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Organization = require('../models/Organization');
const auth = require('../middleware/auth');

// Register a new organization
router.post('/register', async (req, res) => {
    try {
        const { name, orgId, password, parentOrganization, level, isVenueManager } = req.body;

        // Check if organization already exists
        let organization = await Organization.findOne({ orgId });
        if (organization) {
            return res.status(400).json({ message: 'Organization already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new organization
        organization = new Organization({
            name,
            orgId,
            password: hashedPassword,
            parentOrganization,
            level,
            isVenueManager
        });

        await organization.save();

        // Create token
        const token = jwt.sign(
            { id: organization._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            organization: {
                id: organization._id,
                name: organization.name,
                orgId: organization.orgId,
                level: organization.level,
                isVenueManager: organization.isVenueManager
            },
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login organization
router.post('/login', async (req, res) => {
    try {
        const { orgId, password } = req.body;

        // Check if organization exists
        const organization = await Organization.findOne({ orgId });
        if (!organization) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, organization.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { id: organization._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            organization: {
                id: organization._id,
                name: organization.name,
                orgId: organization.orgId,
                level: organization.level,
                isVenueManager: organization.isVenueManager
            },
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

//new code created after working with frontend
router.get('/hierarchy', auth, async (req, res) => {
    try {
      // Get all organizations
      const organizations = await Organization.find().lean();
      
      // Create a map for quick lookup
      const orgMap = new Map();
      organizations.forEach(org => {
        org.children = [];
        orgMap.set(org._id.toString(), org);
      });
      
      // Build the tree
      const root = organizations.find(org => org.level === 0); // College is root
      organizations.forEach(org => {
        if (org.parentOrganization) {
          const parentId = org.parentOrganization.toString();
          const parent = orgMap.get(parentId);
          if (parent) {
            parent.children.push(org);
          }
        }
      });
      
      res.json(root);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });


module.exports = router;