// src/models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    description: 'must be a string and is required'
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    description: 'must be a string and is required'
  },
  lastName: {
    type: String,
    required: true,
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
  bio: {
    type: String,
    default: "",
    description: 'personal bio'
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
{ collection: 'User', versionKey: false }
);

userSchema.pre('save',  async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
