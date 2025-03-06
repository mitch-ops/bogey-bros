// src/models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    description: 'must be a string and is required'
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^.+@.+\..+$/,
    description: 'must be a valid email and is required'
  },
  passwordHash: {
    type: String,
    required: true,
    description: 'must be a string and is required'
  },
  handicap: {
    type: Number,
    description: 'must be a number if provided'
  },
  stats: {
    strokeplay: {
      roundsPlayed: { type: Number, description: 'must be a number' },
      wins: { type: Number, description: 'must be a number' },
      losses: { type: Number, description: 'must be a number' },
      averageScore: { type: Number, description: 'must be a number' }
    },
    matchplay: {
      roundsPlayed: { type: Number, description: 'must be a number' },
      wins: { type: Number, description: 'must be a number' },
      losses: { type: Number, description: 'must be a number' }
    }
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    description: 'must be an array of ObjectIds'
  }],
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    description: 'must be a date'
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now,
    description: 'must be a date'
  }
}, 
{ collection: 'User' }
);

userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
