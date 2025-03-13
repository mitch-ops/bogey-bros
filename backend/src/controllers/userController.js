const User = require('../models/userModel');
const FriendRequest = require('../models/friendRequestModel');

// Get user by username
const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });

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
  const { email } = req.params;
  const updateData = { ...req.body };

  // Return an error if trying to update password or email
  if (updateData.passwordHash) {
    return res.status(400).json({ message: 'Updating password is not allowed through this endpoint.' });
  }

  if (updateData.email) {
    return res.status(400).json({ message: 'Updating email is not allowed through this endpoint.' });
  }

  try {

    updateData.updatedAt = new Date();
    // Update user and return the new user object
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: updateData },
      { new: true, timestamps: false }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteUser = async (req, res) => {
  const { email } = req.params;

  try {
    // Find the user by email
    const deletedUser = await User.findOneAndDelete({ email });

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
      { friends: deletedUser._id }, // Find users who have this user as a friend
      { $pull: { friends: deletedUser._id } } // Remove from friends array
    );

    return res.status(200).json({ message: 'User and associated friend requests deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getUser, updateUser, deleteUser };
