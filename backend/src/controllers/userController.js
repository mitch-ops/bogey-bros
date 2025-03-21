const User = require('../models/userModel');
const FriendRequest = require('../models/friendRequestModel');

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

    await User.updateMany(
      { friends: deletedUser._id }, 
      { $pull: { friends: deletedUser._id } } // Remove from friends arrays
    );

    return res.status(200).json({ message: 'User and associated friend requests deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getUser, updateUser, deleteUser };
