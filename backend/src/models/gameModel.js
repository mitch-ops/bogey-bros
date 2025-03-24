const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameName: {
    type: String,
    required: true,
    description: 'Name of the game'
  },
  courseName: {
    type: String,
    required: true,
    description: 'Name of the course'
  },
  startTime: {
    type: Date,
    required: true,
    description: 'The start time of the game'
  },
  status: {
    type: String,
    enum: ['In-Progress', 'Completed'],
    default: 'In-Progress',
    description: 'Current status of the game'
  },
  mode: {
    type: String,
    enum: ['Strokeplay', 'Matchplay'],
    required: true,
    description: 'type of betting'
  },
  pot: {
    type: Number,
    required: true,
    description: 'total amount of money at stake'
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    description: 'Array of user IDs for the participants'
  }],
  scores: {
    type: [[Number]],
    required: true,
    description: 'An array of scores for each participant on this hole, in the same order as the participants array'
  },
  totals: {
    type: [[Number]],
    required: true,
    description: 'An array of score totals for each participant'
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
}, { collection: 'Game', versionKey: false });

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
