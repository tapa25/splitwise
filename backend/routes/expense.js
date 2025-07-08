// backend/routes/expense.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Our authentication middleware
const Expense = require('../models/Expense');
const Group = require('../models/Group');

// @route   POST /api/expenses/add
// @desc    Add a new expense to a group
// @access  Private
router.post('/add', auth, async (req, res) => {
    const { description, amount, groupId, paidByUserId } = req.body; // paidByUserId is the _id of the user who paid

    try {
        // Basic validation
        if (!description || !amount || !groupId || !paidByUserId) {
            return res.status(400).json({ msg: 'Please enter all fields: description, amount, group ID, and paidBy user ID.' });
        }

        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ msg: 'Amount must be a positive number.' });
        }

        // 1. Verify group exists and user is a member of the group
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ msg: 'Group not found.' });
        }
        if (!group.members.includes(req.user.id)) {
            return res.status(403).json({ msg: 'Not authorized to add expenses to this group.' });
        }

        // 2. Verify that paidByUserId is indeed a member of this group
        if (!group.members.includes(paidByUserId)) {
            return res.status(400).json({ msg: 'The user specified as "paid by" is not a member of this group.' });
        }

        // Create new expense
        const newExpense = new Expense({
            description,
            amount,
            paidBy: paidByUserId, // The ID of the user who paid
            group: groupId
        });

        const expense = await newExpense.save();
        res.status(201).json(expense);

    } catch (err) {
        console.error(err.message);
        // Handle CastError if invalid ID is provided
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Group ID or User ID.' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/expenses/group/:groupId
// @desc    Get all expenses for a specific group
// @access  Private
router.get('/group/:groupId', auth, async (req, res) => {
    try {
        const groupId = req.params.groupId;

        // Verify group exists and user is a member
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ msg: 'Group not found.' });
        }
        if (!group.members.includes(req.user.id)) {
            return res.status(403).json({ msg: 'Not authorized to view expenses for this group.' });
        }

        // Fetch expenses for the group, populate paidBy user and sort by creation date
        const expenses = await Expense.find({ group: groupId })
                                    .populate('paidBy', 'username email') // Populate details of the user who paid
                                    .sort({ createdAt: -1 }); // Sort by newest first

        res.json(expenses);

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Group ID.' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;