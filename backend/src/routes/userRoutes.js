const express = require('express');
const { getUser, updateUser, deleteUser } = require('../controllers/userController');
const { verifyToken } = require('../controllers/authController');
const router = express.Router();

router.get('/api/users/:email', verifyToken, getUser);
router.put('/api/users/:email', verifyToken, updateUser);
router.delete('/api/users/:email', verifyToken, deleteUser);
  
module.exports = router;
