const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const router = express.Router();

// Register route
router.post('/api/register', registerUser);

// Login route
router.post('/api/login', loginUser);

module.exports = router;
