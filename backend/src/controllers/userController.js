const User = require('../models/userModel');
const FriendRequest = require('../models/friendRequestModel');
const Invite = require('../models/inviteModel');
const Game = require('../models/gameModel');
const Transaction = require('../models/transactionModel');

// Get user by username
const getUser = async (req, res) => {
  try {
    const userId = req.user.userId; 
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = user.toObject();
    return res.status(200).json(userData);

  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getFriendInfo = async (req, res) => {
  try {
    const userId = req.user.userId; 
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.friends || user.friends.length === 0) {
      return res.status(200).json({ friends: [] });
    }
  
    const friendsData = await User.find({
      _id: { $in: user.friends }
    })
      .select('firstName lastName username handicap profilePicture')
      .lean();
  
    const friends = friendsData.map(f => ({
      firstName:       f.firstName,
      lastName:        f.lastName,
      username:        f.username,
      handicap:        f.handicap,
      profilePicture:  f.profilePicture
                         ? f.profilePicture.buffer
                             ? f.profilePicture.buffer.toString('base64')
                             : Buffer.from(f.profilePicture).toString('base64')
                         : null
    }));

    return res.status(200).json({ friends });
  } catch (error) { 
    console.error('Error fetching friend info:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateUser = async (req, res) => {
  const updateData = { ...req.body };

  // Return an error if trying to update password or email
  if (updateData.passwordHash) {
    return res.status(400).json({ message: 'Updating password is not allowed through this endpoint.' });
  }

  if (updateData.email) {
    return res.status(400).json({ message: 'Updating email is not allowed through this endpoint.' });
  }

  try {
    const userId = req.user.userId; 

    // Update user and return the new user object
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, timestamps: false }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    updateData.updatedAt = new Date();

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteUser = async (req, res) => {
  const userId = req.user.userId;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete friend requests where the user was a sender or receiver
    await FriendRequest.deleteMany({
      $or: [
        { senderId: deletedUser._id },
        { receiverId: deletedUser._id }
      ]
    });

    await Transaction.deleteMany({
      status: "Completed",
      $or: [
        { payerId: deletedUser._id },
        { receiverId: deletedUser._id }
      ]
    })

    await Invite.deleteMany({
      $or: [
        { senderId: deletedUser._id },
        { receiverId: deletedUser._id }
      ]
    });

    await User.updateMany(
      { friends: deletedUser._id }, 
      { $pull: { friends: deletedUser._id } } 
    );

    const gamesWithUser = await Game.find({ participants: deletedUser._id });
    for (const game of gamesWithUser) {
      if (game.participants.length === 1) {
        await Game.findByIdAndDelete(game._id);
      } else {
          const index = game.participants.findIndex(
            (participantId) => participantId.equals(deletedUser._id)
          );

          if (index !== -1) {
            game.participants.splice(index, 1);

            game.scores.forEach((holeScores) => {
              holeScores.splice(index, 1);
            });

            game.totals.splice(index, 1);

            await game.save();
          }
      }
    }

    return res.status(200).json({ message: 'User and associated friend requests deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getActivity = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select("friends");
    if (!user) return res.status(404).json({ message: "User not found" });

    const friendIds = user.friends;

    const friends = await User.find({ _id: { $in: friendIds } }).select("firstName lastName username");

    const gameBatches = await Promise.all(
      friends.map(friend =>
        Game.find({
              participants: friend._id,
              status: "Completed"
            })
            .sort({ startTime: -1 })
            .limit(3)
            .select("courseName startTime participants totals scores")
            .lean()
            .then(games => ({ friend, games }))
      )
    );

    let nextId = 1;
    const activities = [];
    gameBatches.forEach(({ friend, games }) => {
      games.forEach(game => {
        const idx = game.participants
                        .findIndex(p => p.toString() === friend._id.toString());
        if (idx === -1) return;                    

        const totalStrokes = game.totals[idx][2];

        activities.push({
          id: nextId++,
          user: `${friend.firstName} ${friend.lastName ?? ""}.`,
          course: game.courseName,
          date: new Date(game.startTime).toLocaleDateString("en-US"),
          score: totalStrokes,
          holes: `${game.scores.length} holes`      
        });
      });
    });

    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    return res.json({ activities });
  } catch (err) {
    console.error("Error fetching user activity:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate the ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return only non-sensitive information
    return res.status(200).json({
      _id: user._id,
      username: user.username,
      handicap: user.handicap
    });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided.' });
    }

    const imageBuffer = req.file.buffer;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: imageBuffer, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ 
      message: 'Profile picture updated successfully', 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = { getUser, getFriendInfo, updateUser, deleteUser, getUserById, updateProfilePicture, getActivity };
