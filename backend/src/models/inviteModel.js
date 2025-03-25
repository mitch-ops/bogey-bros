const mongoose = require('mongoose');

const playInviteSchema = new mongoose.Schema({
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
        description: 'must be a valid ObjectId referencing a User and is required'
      },
    stake: {
        type: Number,
        required: true,
        description: 'how much each player puts in the pot'
    },
    mode: {
        type: String,
        enum: ['Strokeplay', 'Matchplay'],
        required: true,
        description: 'type of betting'
    },
    name: {
        type: String,
        default: 'Unnamed Game',
        description: 'name of the game'
    },
    course: {
        type: String,
        default: 'Unnamed Course',
        description: 'name of the course'
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Declined'],
        default: 'Pending',
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

}, { collection: 'PlayInvite', versionKey: false });

const playInvite = mongoose.model('playInvite', playInviteSchema);

module.exports = playInvite;