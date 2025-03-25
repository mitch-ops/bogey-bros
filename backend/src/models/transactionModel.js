const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({

    gameName: {
        type: String,
        required: true,
        description: 'Name of the game'
    },
    payerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        description: 'you lose lol'
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        description: 'you win lol'
    },
    amount: {
        type: Number,
        required: true,
        description: 'amount paid'
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending',
        description: 'Current status of the transaction'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        description: 'must be a date'
    }

}, { collection: 'Transaction', versionKey: false });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;