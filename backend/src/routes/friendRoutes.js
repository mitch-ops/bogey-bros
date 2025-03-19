const express = require('express');
const router = express.Router();
const { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriendRequests } = require('../controllers/friendController');
const { verifyToken } = require('../controllers/authController');
const { sendPlayInvite, acceptPlayInvite, rejectPlayInvite, getPlayInvites } = require('../controllers/inviteController');

router.post('/api/friends', verifyToken, sendFriendRequest);
router.post('/api/friends/accept', verifyToken, acceptFriendRequest);
router.post('/api/friends/reject', verifyToken, rejectFriendRequest);
router.get('/api/friends', verifyToken, getFriendRequests);
router.post('/api/invite', verifyToken, sendPlayInvite);
router.post('/api/invite/accept', verifyToken, acceptPlayInvite);
router.post('/api/invite/reject', verifyToken, rejectPlayInvite);
router.get('/api/invite', verifyToken, getPlayInvites);

module.exports = router;