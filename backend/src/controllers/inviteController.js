const { default: mongoose } = require('mongoose');
const PlayInvite = require('../models/playInviteModel'); 
const User = require('../models/userModel');

const sendPlayInvite = async (req, res) => {
  try {
    const { receiverId, stake, mode, course } = req.body;
    const senderId = req.user.userId; 

    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ error: "Sender not found." });
    }

    // Check if the receiver is in the current user's friends array
    if (!sender.friends.includes(receiverId)) {
      return res.status(400).json({ error: "User is not in your friends list." });
    }

    const newInvite = new PlayInvite({
      senderId,
      receiverId,
      stake,
      mode,
      course, 
      status: "Pending" 
    });

    await newInvite.save();

    res.status(201).json({ message: "Play invite sent successfully.", invite: newInvite });
  } catch (error) {
    console.error("Error sending play invite:", error);
    res.status(500).json({ error: "Server error." });
  }
};

const acceptPlayInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const playInvite = await PlayInvite.findById(inviteId);

    if (!playInvite || playInvite.receiverId.toString() !== req.user.userId) {
      return res.status(404).json({ message: "Play invite not found" });
    }

    playInvite.status = 'Accepted';
    playInvite.updatedAt = Date.now();
    await playInvite.save();

    return res.json({ message: "Play invite accepted", invite: playInvite });
  } catch (error) {
    console.error('Error accepting play invite:', error);
    return res.status(500).json({
      message: 'Error accepting play invite',
      error: error.message
    });
  }
};

const rejectPlayInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const playInvite = await PlayInvite.findById(inviteId);

    if (!playInvite || playInvite.receiverId.toString() !== req.user.userId) {
      return res.status(404).json({ message: "Play invite not found" });
    }

    playInvite.status = 'Declined';
    playInvite.updatedAt = Date.now();
    await playInvite.save();

    return res.json({ message: "Play invite rejected", invite: playInvite });
  } catch (error) {
    console.error('Error rejecting play invite:', error);
    return res.status(500).json({
      message: 'Error rejecting play invite',
      error: error.message
    });
  }
};

const getPlayInvites = async (req, res) => {
  try {
    const invites = await PlayInvite.find({
      receiverId: req.user.userId,
      status: 'Pending'
    }).populate('senderId', 'username'); 

    return res.json(invites);
  } catch (error) {
    console.error('Error getting play invites:', error);
    return res.status(500).json({
      message: 'Error getting play invites',
      error: error.message
    });
  }
};

module.exports = {
  sendPlayInvite,
  acceptPlayInvite,
  rejectPlayInvite,
  getPlayInvites
};
