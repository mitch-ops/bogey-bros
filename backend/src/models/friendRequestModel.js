const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema({
    senderId: {
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
        enum: ['Pending', 'Accepted', 'Declined'],
        default: 'pending',
        description: 'must be a string and is required'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        description: 'must be a date'
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        description: 'must be a date'
    }
}, { collection: 'FriendRequest', versionKey: false });

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

module.exports = FriendRequest;