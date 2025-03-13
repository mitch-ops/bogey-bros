const { default: mongoose } = require('mongoose');
const FriendRequest = require('../models/friendRequestModel');
const User = require('../models/userModel');

// POST /api/friends/requests
// Body : { username: 'friendUsername' }
// Send friend request
const sendFriendRequest = async (req, res) => {
    try {
        const { username } = req.body;
        const senderId = req.user.userId;
        
        // Get the receiver
        const receiver = await User.findOne({ username });
        if (!receiver) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Avoid sending friend request to yourself
        if (receiver._id.toString() === senderId) {
            return res.status(400).json({ message: "You can't send a friend request to yourself" });
        }
        
        // Avoid sending friend request to an already friend
        const sender = await User.findById(senderId);
        if (!sender) {
            return res.status(404).json({ message: 'Sender not found' });
        }
        
        if (sender.friends.includes(receiver._id)) {
            return res.status(400).json({ message: 'User is already your friend' });
        }
        
        // Existing friend request
        const existing = await FriendRequest.findOne({ 
            senderId, 
            receiverId: receiver._id, 
            status: 'Pending' 
        });
        
        if (existing) {
            return res.status(400).json({ message: 'Friend request already sent' });
        }
        
        // Create friend request matching the exact schema validation requirements
        const requestData = {
            senderId: new mongoose.Types.ObjectId(senderId),
            receiverId: new mongoose.Types.ObjectId(receiver._id.toString()),
            status: 'Pending',  // Capital P to match the validation enum
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const request = await FriendRequest.create(requestData);
        
        return res.status(201).json({ 
            message: 'Friend request sent', 
            data: request 
        });
    } catch (error) {
        console.error('Error creating friend request:', error);
        return res.status(500).json({ 
            message: 'Error creating friend request', 
            error: error.message 
        });
    }
};

// POST /api/friends/accept/:requestId
// Accept friend request
const acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const friendRequest = await FriendRequest.findById(requestId);
        
        if (!friendRequest || friendRequest.receiverId.toString() !== req.user.userId) {
            return res.status(404).json({ message: "Friend request not found" });
        }
        
        // Set status to Accepted
        friendRequest.status = 'Accepted';
        await friendRequest.save();
        
        // Update the friends array for sender and receiver
        await User.findByIdAndUpdate(friendRequest.senderId, { 
            $addToSet: { friends: friendRequest.receiverId } 
        });
        
        await User.findByIdAndUpdate(friendRequest.receiverId, { 
            $addToSet: { friends: friendRequest.senderId } 
        });
        
        return res.json({ message: "Friend request accepted" });
    } catch (error) {
        console.error('Error accepting friend request:', error);
        return res.status(500).json({ 
            message: 'Error accepting friend request', 
            error: error.message 
        });
    }
};

// POST /api/friends/reject/:requestId
// Reject friend request
const rejectFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const friendRequest = await FriendRequest.findById(requestId);
        
        if (!friendRequest || friendRequest.receiverId.toString() !== req.user.userId) {
            return res.status(404).json({ message: "Friend request not found" });
        }
        
        // Set status to Declined
        friendRequest.status = 'Declined';
        await friendRequest.save();
        
        return res.json({ message: "Friend request rejected" });
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        return res.status(500).json({ 
            message: 'Error rejecting friend request', 
            error: error.message 
        });
    }
};

// GET /api/friends/requests
// Get friend requests
const getFriendRequests = async (req, res) => {
    try {
        const requests = await FriendRequest.find({ 
            receiverId: req.user.userId, 
            status: 'Pending'  // Capitalized to match database validation
        }).populate('senderId', 'username');
        
        return res.json(requests);
    } catch (error) {
        console.error('Error getting friend requests:', error);
        return res.status(500).json({ 
            message: 'Error getting friend requests', 
            error: error.message 
        });
    }
};

module.exports = { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriendRequests };