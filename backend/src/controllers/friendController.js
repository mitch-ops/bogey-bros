const FriendRequest = require('../models/friendRequestModel');

// POST /api/friends/requests
// Body : { username: 'friendUsername' }
// Send friend request
const sendFriendRequest = async (req, res ) => {
    const { username } = req.body;
    const senderId = req.user.id; // From JWT

    // get the receiver
    const receiver = await User.findOne({ username });
    if (!receiver) {
        return res.status(404).json({ message: 'User not found'});
    }

    // Avoid sending friend request to yourself
    if (receiver._id.toString() === senderId) {
        return res.status(400).json({ message: "You can't send a friend request to yourself" });
    }
    
    // Avoid sending friend request to an already friend
    const sender = await User.findById(senderId);
    if (sender.friends.includes(receiver._id)) {
      return res.status(400).json({ message: 'User is already your friend' });
    }

    // Existing friend request
    const existing = await FriendRequest.findOne({ senderId, receiverId: receiver._id, status: 'pending' });
    if (existing) {
        return res.status(400).json({ message: 'Friend request already sent'});
    }

    // create friend request
    const request = await FriendRequest.create({
        senderId,
        receiverId: receiver._id,
    });

    res.status(201).json({ message: 'Friend request sent', data: request });
};

// POST /api/friends/accept/:requestId
const acceptFriendRequest = async (req, res) => {
    const { requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest || friendRequest.receiverId.toString() !== req.user.id) {
        return res.status(404).json({ message: "Friend request not found" });
    }

    // set status to accepted
    friendRequest.status = 'Accepted';
    await friendRequest.save();

    // Update the friends array for sender and receiver
    await User.findByIdAndUpdate(request.senderId, { $addToSet: { friends: request.receiverId } });
    await User.findByIdAndUpdate(request.receiverId, { $addToSet: { friends: request.senderId } });
  
    res.json({ message: "Friend request accepted" });
};

// POST /api/friends/reject/:requestId
const rejectFriendRequest = async (req, res) => {
    const { requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest || friendRequest.receiverId.toString() !== req.user.id) {
        return res.status(404).json({ message: "Friend request not found" });
    }

    // set status to rejected
    friendRequest.status = 'Rejected';
    await friendRequest.save();

    res.json({ message: "Friend request rejected" });
}

// GET /api/friends/requests, gets incoming friend requests
const getFriendRequests = async (req, res) => {
    const requests = await FriendRequest.find({ receiverId: req.user.id, status: 'Pending' }).populate('senderId', 'username'); // Maybe change to just senderId
    res.json(requests);
};

module.exports = { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriendRequests };