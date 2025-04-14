const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET

// Register a new user
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
  
    try {
      // Check if user already exists
      const existingUserEmail = await User.findOne({ email });
      const existingUserUsername = await User.findOne({ username });
      if (existingUserEmail || existingUserUsername) {
        return res.status(400).json({ message: 'User already exists' });
      }

  
      const newUser = new User({
        username,
        email,
        passwordHash: password, 
        handicap: 0,
        stats: {
          strokeplay: {
            roundsPlayed: 0,
            wins: 0,
            losses: 0,
            averageScore: 0
          },
          matchplay: {
            roundsPlayed: 0,
            wins: 0,
            losses: 0
          }
        },
        friends: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await newUser.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };  

// Login user and return JWT
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const payload = { userId: user._id, username: user.username, email: user.email };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body; 

  if (!refreshToken) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    const payload = { 
      userId: decoded.userId, 
      username: decoded.username, 
      email: decoded.email 
    };

    const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
    res.json({ accessToken: newAccessToken });
  });
};

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'No token provided' });
  
    jwt.verify(token.split(' ')[1], JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ message: 'Invalid token' });
      req.user = decoded;  // Attach decoded token to request
      next();
    });
  };

module.exports = { registerUser, loginUser, refreshToken, verifyToken };
