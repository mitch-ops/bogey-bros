const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema({
    snederId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        description: 'must be an ObjectId and is required'
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        description: 'must be an ObjectId and is required'
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending',
        description: 'must be a string and is required'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        description: 'must be a date'
    },
    upDatedAt: {
        type: Date,
        default: Date.now,
        description: 'must be a date'
    }
}, { collection: 'FriendRequest', versionKey: false });

module.exports = mongoose.model('FriendRequest', friendRequestSchema);