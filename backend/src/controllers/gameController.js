const { default: mongoose } = require('mongoose');
const PlayInvite = require('../models/inviteModel'); 
const Game = require('../models/gameModel');
const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');

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
      mode: mode,
      pot: stake,
      participants: [senderId],
      scores: Array(18).fill().map(() => [0]),
      totals: [[0,0,0]]
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

    const game = await Game.findOne({ gameName: playInvite.name });
    if (!game) {
      return res.status(404).json({message: "Game not found"});
    }

    playInvite.status = 'Accepted';
    playInvite.updatedAt = Date.now();
    game.pot += playInvite.stake;
    game.participants.push(req.user.userId);
    game.scores.forEach(arr => arr.push(0));
    game.totals.push([0,0,0]);
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

const updateScore = async (req, res) => {
  try {
    const { gameName, hole, score } = req.body;
    const senderId = req.user.userId;

    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ error: "Sender not found." });
    }

    const game = await Game.findOne({ gameName });
    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }

    if (game.status == 'Completed') {
      return res.status(403).json({ error: "Game is completed and cannot be updated" });
    }

    // Ensure the user is a participant of this game
    const userIndex = game.participants.findIndex(
      (participant) => participant.toString() === sender._id.toString()
    );
    if (userIndex === -1) {
      return res
        .status(403)
        .json({ error: "User is not a participant of this game." });
    }

    const holeIndex = hole - 1; 

    if (holeIndex < 0 || holeIndex >= game.scores.length) {
      return res.status(400).json({ error: "Hole index out of range." });
    }

    // Update the totals array based on the hole number
    if (hole >= 1 && hole <= 9) {
      game.totals[userIndex][0] -= game.scores[holeIndex][userIndex];
      game.totals[userIndex][2] -= game.scores[holeIndex][userIndex];
      game.totals[userIndex][0] += score; 
      game.totals[userIndex][2] += score;
    } else if (hole >= 10 && hole <= 18) {
      game.totals[userIndex][1] -= game.scores[holeIndex][userIndex];
      game.totals[userIndex][2] -= game.scores[holeIndex][userIndex];
      game.totals[userIndex][1] += score; 
      game.totals[userIndex][2] += score;
    }

    game.scores[holeIndex][userIndex] = score;

    game.updatedAt = new Date();

    await game.save();

    return res.status(200).json({
      success: true,
      message: "Score updated successfully.",
      game,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error." });
  }
};

const findWinners = (totals, arrayIndex) => {
  let maxVal = -Infinity;
  totals.forEach(total => {
    if (total[arrayIndex] > maxVal) {
      maxVal = total[arrayIndex];
    }
  });
  const indices = [];
  totals.forEach((total, index) => {
    if (total[arrayIndex] === maxVal) {
      indices.push(index);
    }
  });
  return indices;
};

// 2) Function to calculate the transactions (returns array of { payId, receiverId, amount })
function calculateTransactions(participants, winnersPerCategory, stake) {
  // Convert ObjectIds to strings for internal mapping
  const participantsStr = participants.map(oid => oid.toString());

  // Tally fractional wins for each participant.
  // For each category, each winner gets (1 / numberOfWinnersForThatCategory) win.
  const winCount = {};
  participantsStr.forEach(idStr => { winCount[idStr] = 0; });
  winnersPerCategory.forEach(winnerArray => {
    const fraction = 1 / winnerArray.length;
    winnerArray.forEach(winnerId => {
      const winnerStr = winnerId.toString();
      if (winCount.hasOwnProperty(winnerStr)) {
        winCount[winnerStr] += fraction;
      }
    });
  });

  const numPlayers = participants.length;
  const totalPot = numPlayers * stake;
  const shareAmount = totalPot / 3; // each category is worth 1/3 of the pot

  // Calculate net = (total fractional wins * shareAmount) - stake
  const netMap = {};
  participantsStr.forEach(idStr => {
    const wins = winCount[idStr] || 0;
    netMap[idStr] = wins * shareAmount - stake;
  });

  // Split into debtors (net < 0) and creditors (net > 0)
  const debtors = [];
  const creditors = [];
  for (const [idStr, net] of Object.entries(netMap)) {
    if (net > 0) {
      creditors.push({ idStr, amount: net });
    } else if (net < 0) {
      debtors.push({ idStr, amount: -net }); // store positive value
    }
  }

  // Match up debtors and creditors to generate one-on-one transactions
  const transactions = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const transferAmount = Math.min(debtor.amount, creditor.amount);

    // Convert string IDs back to original ObjectId from participants
    const payId = participants.find(oid => oid.toString() === debtor.idStr);
    const receiverId = participants.find(oid => oid.toString() === creditor.idStr);

    transactions.push({ payId, receiverId, amount: transferAmount });

    debtor.amount -= transferAmount;
    creditor.amount -= transferAmount;
    if (debtor.amount === 0) i++;
    if (creditor.amount === 0) j++;
  }

  return transactions;
}

const endGame = async (req, res) => {
  try {
    const { gameName } = req.body;
    const senderId = req.user.userId;
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ error: "Sender not found." });
    }

    const game = await Game.findOne({ gameName });
    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }

    // Ensure the one ending the game is the game's creator
    const userIndex = game.participants.findIndex(
      (participant) => participant.toString() === sender._id.toString()
    );
    if (userIndex === -1) {
      return res
        .status(403)
        .json({ error: "User is not a participant of this game." });
    }
    if (userIndex !== 0) {
      return res
        .status(403)
        .json({ error: "Only the creator of a game can end it." });
    }
    
    // Compute winners for each category, handling ties
    const frontIndices = findWinners(game.totals, 0);
    const backIndices = findWinners(game.totals, 1);
    const totalIndices = findWinners(game.totals, 2);

    // Map indices to participant ObjectIds for each category
    const winnersFront = frontIndices.map(i => game.participants[i]);
    const winnersBack = backIndices.map(i => game.participants[i]);
    const winnersTotal = totalIndices.map(i => game.participants[i]);
    const winnersPerCategory = [winnersFront, winnersBack, winnersTotal];

    const players = game.participants;
    // Each player contributes equally to the pot
    const stake = game.pot / players.length;

    console.log("Players:", players);
    console.log("Winners per category:", winnersPerCategory);
    console.log("Individual stake:", stake);

    // Calculate the one-on-one transactions with the updated winners
    const transactionsData = calculateTransactions(players, winnersPerCategory, stake);

    // Create new Transaction objects
    const transactionObjects = [];
    for (const txData of transactionsData) {
      const newTransaction = new Transaction({
        gameName: game.gameName,
        payerId: txData.payId,
        receiverId: txData.receiverId,
        amount: txData.amount,
        status: "Pending" // or "Completed", as needed
      });
      transactionObjects.push(newTransaction);
    }

    // Save each Transaction document
    for (const transaction of transactionObjects) {
      await transaction.save();
    }

    // Mark the game as ended (or completed) and save
    game.status = "Completed";
    await game.save();

    return res.json({
      message: "Game ended successfully.",
      transactions: transactionObjects,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error." });
  }
};


module.exports = {
  sendPlayInvite,
  acceptPlayInvite,
  rejectPlayInvite,
  getPlayInvites,
  updateScore,
  endGame
};
