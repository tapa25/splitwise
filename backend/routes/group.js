// backend/routes/group.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Our authentication middleware
const Group = require('../models/Group');
const User = require('../models/User'); // Assuming you have a User model

// @route   POST /api/groups
// @desc    Create a new group (Example: For testing, you'd have a separate route for this)
// @access  Private
router.post('/', auth, async (req, res) => {
    const { name } = req.body;
    try {
        // For simplicity, make the creator the first member
        const newGroup = new Group({
            name,
            members: [req.user.id] // Current logged-in user is a member
        });
        const group = await newGroup.save();
        res.status(201).json(group);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/groups
// @desc    Get all groups the authenticated user is a member of
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const groups = await Group.find({ members: req.user.id }).populate('members', 'username email');
        res.json(groups);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/groups/:groupId
// @desc    Get a specific group by ID
// @access  Private
router.get('/:groupId', auth, async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId).populate('members', 'username email');

        if (!group) {
            return res.status(404).json({ msg: 'Group not found' });
        }

        // Check if the authenticated user is a member of the group
        if (!group.members.some(member => member._id.toString() === req.user.id)) {
            return res.status(403).json({ msg: 'Not authorized to view this group' });
        }

        res.json(group);
    } catch (err) {
        console.error(err.message);
        // Handle CastError if invalid groupId is provided
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Group not found (Invalid ID)' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;