const express = require('express');
const { getUserByUsername } = require('../controllers/userController');
const { verifyToken } = require('../controllers/authController');
const router = express.Router();

router.get('/api/users/:username', verifyToken, getUserByUsername);
  
module.exports = router;
