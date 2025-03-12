const express = require('express');
const router = express.Router();
const { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriendRequests } = require('../controllers/friendController');
const { verifyToken } = require('../controllers/authController');

router.post('/api/friends/request', verifyToken, sendFriendRequest);
router.post('/api/friends/accept/:requestId', verifyToken, acceptFriendRequest);
router.post('/api/friends/reject/:requestId', verifyToken, rejectFriendRequest);
router.get('/api/friends/requests', verifyToken, getFriendRequests);

module.exports = router;