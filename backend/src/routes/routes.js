const express = require('express');
const router = express.Router();
const { getUser, updateUser, deleteUser } = require('../controllers/userController');
const { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriendRequests } = require('../controllers/friendController');
const { verifyToken, registerUser, loginUser } = require('../controllers/authController');
const { sendPlayInvite, acceptPlayInvite, rejectPlayInvite, getPlayInvites, updateScore } = require('../controllers/gameController');

router.post('/api/register', registerUser);
router.post('/api/login', loginUser);
router.get('/api/user', verifyToken, getUser);
router.put('/api/user', verifyToken, updateUser);
router.delete('/api/user', verifyToken, deleteUser);
router.post('/api/friends', verifyToken, sendFriendRequest);
router.post('/api/friends/accept', verifyToken, acceptFriendRequest);
router.post('/api/friends/reject', verifyToken, rejectFriendRequest);
router.get('/api/friends', verifyToken, getFriendRequests);
router.post('/api/invite', verifyToken, sendPlayInvite);
router.post('/api/invite/accept', verifyToken, acceptPlayInvite);
router.post('/api/invite/reject', verifyToken, rejectPlayInvite);
router.get('/api/invite', verifyToken, getPlayInvites);
router.put('/api/game/update', verifyToken, updateScore);

module.exports = router;