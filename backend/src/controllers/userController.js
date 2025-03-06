const User = require('../models/userModel');

// Get user by username
const getUserByUsername = async (req, res) => {

  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { passwordHash, ...userData } = user.toObject();
    return res.status(200).json(userData);

  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getUserByUsername };
