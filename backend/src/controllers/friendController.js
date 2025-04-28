const { default: mongoose } = require('mongoose');
const FriendRequest = require('../models/friendRequestModel');
const User = require('../models/userModel');

const sendFriendRequest = async (req, res) => {
    try {
        const { username } = req.body;
        const senderId = req.user.userId;
        
        const receiver = await User.findOne({ username });
        if (!receiver) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Avoid sending friend request to yourself
        if (receiver._id.toString() === senderId) {
            return res.status(400).json({ message: "You can't send a friend request to yourself" });
        }
        
        // Avoid sending friend request to a friend
        const sender = await User.findById(senderId);
        if (!sender) {
            return res.status(404).json({ message: 'Sender not found' });
        }
        
        if (sender.friends.includes(receiver._id)) {
            return res.status(400).json({ message: 'User is already your friend' });
        }
        
        const existing = await FriendRequest.findOne({ 
            senderId, 
            receiverId: receiver._id, 
            status: 'Pending' 
        });
        
        if (existing) {
            return res.status(400).json({ message: 'Friend request already sent' });
        }
        
        const requestData = {
            senderId: new mongoose.Types.ObjectId(senderId),
            receiverId: new mongoose.Types.ObjectId(receiver._id.toString()),
            status: 'Pending',
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

const acceptFriendRequest = async (req, res) => {
    try {
      const { username } = req.body;
      
      const sender = await User.findOne({ username });
      if (!sender) {
        return res.status(404).json({ message: "Sender not found" });
      }
  
      const friendRequest = await FriendRequest.findOne({ 
        senderId: sender._id,
        receiverId: req.user.userId,
        status: 'Pending'  
      });
  
      if (!friendRequest) {
        return res.status(404).json({ message: "Friend request not found" });
      }
  
      // Accept the friend request
      friendRequest.status = 'Accepted';
      await friendRequest.save();
  
      // Update both users' friends arrays
      await User.findByIdAndUpdate(sender._id, { 
        $addToSet: { friends: req.user.userId }
      });
  
      await User.findByIdAndUpdate(req.user.userId, { 
        $addToSet: { friends: sender._id }
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

const rejectFriendRequest = async (req, res) => {
    try {
        const { username } = req.body;
      
        const sender = await User.findOne({ username });
        if (!sender) {
            return res.status(404).json({ message: "Sender not found" });
        }
    
        const friendRequest = await FriendRequest.findOne({ 
            senderId: sender._id,
            receiverId: req.user.userId,
            status: 'Pending'  
        });

        if (!friendRequest) {
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

const getFriendRequests = async (req, res) => {
    try {
        const requests = await FriendRequest.find({ 
            receiverId: req.user.userId, 
            status: 'Pending'
        }).populate('senderId', 'username');

        console.log(requests);

        if (requests.length === 0) {
            return res.status(404).json({ message: "No friend requests found" });
        }
        
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