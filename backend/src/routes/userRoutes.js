const express = require('express');
const { getUser, updateUser, deleteUser, getUserById } = require('../controllers/userController');
const { verifyToken } = require('../controllers/authController');
const router = express.Router();

router.get('/api/user', verifyToken, getUser);
router.put('/api/user', verifyToken, updateUser);
router.delete('/api/user', verifyToken, deleteUser);
router.get('/api/users/:id', verifyToken, getUserById);
  
module.exports = router;
