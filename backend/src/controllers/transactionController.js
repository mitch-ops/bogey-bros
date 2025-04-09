const Transaction = require('../models/transactionModel');
const User = require('../models/userModel');

const getCredits = async (req, res) => {
    try {
      const transactions = await Transaction.find({
        receiverId: req.user.userId,
        status: 'Pending'
      }).populate('payerId', 'amount'); 
  
      return res.json(transactions);
    } catch (error) {
      console.error('Error getting transactions:', error);
      return res.status(500).json({
        message: 'Error getting transactions',
        error: error.message
      });
    }
  };

const getDebts = async (req, res) => {
    try {
      const transactions = await Transaction.find({
        payerId: req.user.userId,
        status: 'Pending'
      }).populate('payerId', 'amount'); 
  
      return res.json(transactions);
    } catch (error) {
      console.error('Error getting transactions:', error);
      return res.status(500).json({
        message: 'Error getting transactions',
        error: error.message
      });
    }
  };

const markAsCompleted = async (req, res) => {
    try {
      const { id } = req.body;
      const senderId = req.user.userId;
      
      const sender = await User.findById(senderId);
      if (!sender) {
        return res.status(404).json({ error: "Sender not found" });
      }
  
      const transaction = await Transaction
        .findById(id)
        .populate('receiverId'); 
      
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
  
      if (transaction.receiverId.toString() !== senderId) {
        return res.status(400).json({ error: "Transaction can only be completed by the receiver" });
      }
  
      transaction.status = 'Completed';
      await transaction.save();
  
      return res.status(200).json({ message: "Transaction marked as completed", transaction });
      
    } catch (error) {
      console.error('Error completing transaction:', error);
      return res.status(500).json({
        message: 'Error completing transaction',
        error: error.message
      });
    }
  };
  

module.exports = {
    getCredits, 
    getDebts,
    markAsCompleted
  };