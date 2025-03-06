const express = require('express');
const { getUserByUsername } = require('../controllers/userController');
const router = express.Router();

router.get('/api/users/:username', getUserByUsername);
  
module.exports = router;
