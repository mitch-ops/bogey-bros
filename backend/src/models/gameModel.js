const mongoose = require('mongoose');

const scoreTupleSchema = new mongoose.Schema({
  holeNumber: {
    type: Number,
    required: true,
    description: 'The hole number'
  },
  scores: {
    type: [Number],
    required: true,
    description: 'An array of scores for each participant on this hole, in the same order as the participants array'
  }
}, { _id: false });

const gameSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true,
    description: 'Name of the golf course'
  },
  startTime: {
    type: Date,
    required: true,
    description: 'The start time of the game'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    required: true,
    description: 'Current status of the game'
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    description: 'Array of user IDs for the participants'
  }],
  scores: {
    type: [scoreTupleSchema],
    description: 'Array of tuples each containing the hole number and the scores for each player for that hole'
  }
}, { collection: 'Game', versionKey: false });

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
