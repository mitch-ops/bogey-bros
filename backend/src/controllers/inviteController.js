const { default: mongoose } = require('mongoose');
const PlayInvite = require('../models/playInviteModel'); 
const Game = require('../models/gameModel');
const User = require('../models/userModel');

const sendPlayInvite = async (req, res) => {
  try {
    const { receiverUsernames, stake, mode, name, course } = req.body;  
    const senderId = req.user.userId;  

    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ error: "Sender not found." });
    }

    const receivers = await User.find({ username: { $in: receiverUsernames } });
    // Ensure all usernames were found
    if (receivers.length !== receiverUsernames.length) {
      return res.status(404).json({ error: "One or more receiver usernames not found." });
    }

    const receiverIds = receivers.map(user => user._id.toString());

    const friendIdsAsStrings = sender.friends.map(friendId => friendId.toString());
    console.log(friendIdsAsStrings);

    const allReceiversAreFriends = receiverIds.every(receiverId =>
      friendIdsAsStrings.includes(receiverId)
    );

    if (!allReceiversAreFriends) {
      return res.status(400).json({ error: "All receivers must be in your friends list." });
    }

    const existingInvites = await PlayInvite.find({
      senderId,
      receiverId: { $in: receiverIds },
      status: "Pending"
    });

    if (existingInvites.length > 0) {
      return res.status(400).json({ error: "A pending game invite already exists for one or more recipients." });
    }

    const existingGame = await Game.findOne({ gameName: name });
    if (existingGame) {
      return res.status(400).json({ error: "A game with the given name already exists." });
    }

    // Create a play invite for each receiver
    const invites = receiverIds.map(receiverId => {
      return new PlayInvite({
        senderId,
        receiverId,
        stake,
        mode,
        name,
        course,
        status: "Pending"
      });
    });

    const savedInvites = await Promise.all(invites.map(invite => invite.save()));

    const newGame = new Game({
      gameName: name,
      courseName: course,
      startTime: new Date(),
      participants: [senderId],
      scores: Array.from({ length: 18 }, (_, i) => ({
        holeNumber: i + 1,
        scores: [0]
      }))
    });

    const savedGame = await newGame.save();

    res.status(201).json({ message: "Play invites sent successfully, game created successfully.", invites: savedInvites, savedGame });
  } catch (error) {
    console.error("Error sending play invites:", error);
    res.status(500).json({ error: "Server error." });
  }
};

const acceptPlayInvite = async (req, res) => {
  try {
    const { username } = req.body;

    const sender = await User.findOne({ username });
    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }

    const playInvite = await PlayInvite.findOne({ 
      senderId: sender._id,
      receiverId: req.user.userId,
      status: 'Pending'  
    });

    if (!playInvite || playInvite.receiverId.toString() !== req.user.userId) {
      return res.status(404).json({ message: "Play invite not found" });
    }

    console.log(playInvite.name);
    const game = await Game.findOne({ gameName: playInvite.name });
    console.log(game.gameName);
    if (!game) {
      return res.status(404).json({message: "Game not found"});
    }

    playInvite.status = 'Accepted';
    playInvite.updatedAt = Date.now();
    game.participants.push(req.user.userId);
    game.scores.forEach(scoreTuple => {
      scoreTuple.scores.push(0);
    });
    await playInvite.save();
    await game.save();

    return res.json({ message: "Play invite accepted", invite: playInvite, game });
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
    const { username } = req.body;
    const sender = await User.findOne({ username });
    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }

    const playInvite = await PlayInvite.findOne({ 
      senderId: sender._id,
      receiverId: req.user.userId,
      status: 'Pending'  
    });

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
