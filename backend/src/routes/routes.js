const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getUser, updateUser, getFriendInfo, deleteUser, getUserById, getActivity, updateProfilePicture } = require('../controllers/userController');
const { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriendRequests } = require('../controllers/friendController');
const { verifyToken, registerUser, loginUser, refreshToken } = require('../controllers/authController');
const { sendPlayInvite, acceptPlayInvite, rejectPlayInvite, getPlayInvites, updateScore, getScores, getGameResults, endGame } = require('../controllers/gameController');
const { getCredits, getDebts, markAsCompleted } = require('../controllers/transactionController');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/api/register', registerUser);
router.post('/api/login', loginUser);
router.post('/api/refresh', refreshToken);
router.get('/api/user', verifyToken, getUser);
router.put('/api/user', verifyToken, updateUser);
router.delete('/api/user', verifyToken, deleteUser);
router.get('/api/userById/:id', verifyToken, getUserById);
router.post('/api/friends', verifyToken, sendFriendRequest);
router.post('/api/friends/accept', verifyToken, acceptFriendRequest);
router.post('/api/friends/reject', verifyToken, rejectFriendRequest);
router.get('/api/user/getActivity', verifyToken, getActivity);
router.get('/api/friends', verifyToken, getFriendRequests);
router.post('/api/invite', verifyToken, sendPlayInvite);
router.post('/api/invite/accept', verifyToken, acceptPlayInvite);
router.post('/api/invite/reject', verifyToken, rejectPlayInvite);
router.get('/api/invite', verifyToken, getPlayInvites);
router.put('/api/game/update', verifyToken, updateScore);
router.get('/api/game/scores/:gameName', verifyToken, getScores);
router.get('/api/game/results/:gameName', verifyToken, getGameResults);
router.post('/api/game/end', verifyToken, endGame);
router.get('/api/user/credits', verifyToken, getCredits);
router.get('/api/user/debts', verifyToken, getDebts);
router.post('/api/user/completeTransaction', verifyToken, markAsCompleted);
router.get('/api/user/getFriendInfo', verifyToken, getFriendInfo); 
router.put('/api/user/profilePicture', verifyToken, upload.single('profilePicture'), updateProfilePicture);

module.exports = router;