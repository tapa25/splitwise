// backend/models/Expense.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExpenseSchema = new Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0.01 // Minimum expense amount
    },
    paidBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    group: { // Link to the Group model
        type: Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    // For simplicity, we'll assume all group members are involved in the split
    // For more complex split, you'd have an 'participants' array here
    // e.g., participants: [{ user: {type: Schema.Types.ObjectId, ref: 'User'}, share: Number }]
    date: {
        type: Date,
        default: Date.now // Date when the expense was incurred (can be changed in form)
    },
    createdAt: {
        type: Date,
        default: Date.now // Date when the expense record was created
    }
});

module.exports = mongoose.model('Expense', ExpenseSchema);