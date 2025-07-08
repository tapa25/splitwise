// backend/models/Group.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    members: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    ],
    // You might add more fields like 'createdBy', 'description', etc.
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Group', GroupSchema);