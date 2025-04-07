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


// finds winners given a totals array and an index
function findWinners(totals, arrayIndex) {
  let minVal = Infinity;
  for (const arr of totals) {
    if (arr[arrayIndex] < minVal) {
      minVal = arr[arrayIndex];
    }
  }
  const indices = [];
  totals.forEach((arr, idx) => {
    if (arr[arrayIndex] === minVal) {
      indices.push(idx);
    }
  });
  return indices;
}


// strokeplay result calculation, returns an object with debtors and creditors arrays
function calculateStrokeplayResults(participants, winnersPerCategory, stake) {
  const participantsStr = participants.map(oid => oid.toString());
  const winCount = {};
  participantsStr.forEach(idStr => { winCount[idStr] = 0; });
  
  winnersPerCategory.forEach(winnerArray => {
    const fraction = 1 / winnerArray.length;
    winnerArray.forEach(winnerId => {
      const idStr = winnerId.toString();
      if (winCount.hasOwnProperty(idStr)) {
        winCount[idStr] += fraction;
      }
    });
  });
  
  const numPlayers = participants.length;
  const totalPot = numPlayers * stake;
  const shareAmount = totalPot / 3; 
  const netMap = {};
  
  participantsStr.forEach(idStr => {
    const wins = winCount[idStr] || 0;
    netMap[idStr] = wins * shareAmount - stake;
  });
  
  const creditors = [];
  const debtors = [];
  for (const [idStr, net] of Object.entries(netMap)) {
    if (net > 0) {
      creditors.push({ idStr, amount: net });
    } else if (net < 0) {
      debtors.push({ idStr, amount: -net }); // store positive value
    }
  }
  return { debtors, creditors };
}

// matchplay result calculation, returns an object with debtors and creditors arrays
function calculateMatchplayResults(players, scores, stake) {
  const playersStr = players.map(oid => oid.toString());
  const winCount = {};
  playersStr.forEach(idStr => { winCount[idStr] = 0; });
  
  scores.forEach(scoreArray => {
    const minScore = Math.min(...scoreArray);
    scoreArray.forEach((score, index) => {
      if (score === minScore) {
        const idStr = players[index].toString();
        winCount[idStr] += 1;
      }
    });
  });
  
  const maxWins = Math.max(...Object.values(winCount));
  const winners = playersStr.filter(idStr => winCount[idStr] === maxWins);
  const numPlayers = players.length;
  const totalPot = numPlayers * stake;
  const winnerShare = totalPot / winners.length;
  
  const netMap = {};
  playersStr.forEach(idStr => {
    netMap[idStr] = winners.includes(idStr) ? (winnerShare - stake) : -stake;
  });
  
  const creditors = [];
  const debtors = [];
  for (const [idStr, net] of Object.entries(netMap)) {
    if (net > 0) {
      creditors.push({ idStr, amount: net });
    } else if (net < 0) {
      debtors.push({ idStr, amount: -net });
    }
  }
  return { debtors, creditors };
}

// matches up debtors and creditors
function calculateTransactions(players, debtors, creditors) {
  const transactions = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const transferAmount = Math.min(debtor.amount, creditor.amount);
    
    const payId = players.find(oid => oid.toString() === debtor.idStr);
    const receiverId = players.find(oid => oid.toString() === creditor.idStr);
    
    transactions.push({ payId, receiverId, amount: transferAmount });
    
    debtor.amount -= transferAmount;
    creditor.amount -= transferAmount;
    
    if (debtor.amount === 0) i++;
    if (creditor.amount === 0) j++;
  }
  return transactions;
}

// computes game results based on the game mode
function computeGameResults(game) {
  const players = game.participants;
  const stake = game.pot / players.length;
  
  if (game.mode === "Strokeplay") {
    const frontIndices = findWinners(game.totals, 0);
    const backIndices = findWinners(game.totals, 1);
    const totalIndices = findWinners(game.totals, 2);
    
    const winnersFront = frontIndices.map(i => game.participants[i]);
    const winnersBack = backIndices.map(i => game.participants[i]);
    const winnersTotal = totalIndices.map(i => game.participants[i]);
    const winnersPerCategory = [winnersFront, winnersBack, winnersTotal];
    
    return calculateStrokeplayResults(players, winnersPerCategory, stake);
  } else {
    return calculateMatchplayResults(players, game.scores, stake);
  }
}

// retrieves game results (debtors and creditors) without finalizing the game
const getGameResults = async (req, res) => {
  try {
    const { gameName } = req.params;
    const senderId = req.user.userId;
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ error: "Sender not found." });
    }
    const game = await Game.findOne({ gameName });
    if (!game) {
      return res.status(404).json({ error: "Game not found." });
    }

    const userIndex = game.participants.findIndex(
      participant => participant.toString() === sender._id.toString()
    );
    if (userIndex === -1) {
      return res.status(403).json({ error: "User is not a participant of this game." });
    }

    const results = computeGameResults(game);
    return res.json(results);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error." });
  }
};

// ends the game, creates transactions, and updates the game status
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

    // ensures the user ending the game is the game's creator
    const userIndex = game.participants.findIndex(
      participant => participant.toString() === sender._id.toString()
    );
    if (userIndex === -1) {
      return res.status(403).json({ error: "User is not a participant of this game." });
    }
    if (userIndex !== 0) {
      return res.status(403).json({ error: "Only the creator of a game can end it." });
    }

    const players = game.participants;
    // computes the game results (debtors and creditors) 
    const results = computeGameResults(game);

    // calculates transactions
    const transactionsData = calculateTransactions(players, results.debtors, results.creditors);

    const transactionObjects = [];
    for (const txData of transactionsData) {
      const newTransaction = new Transaction({
        gameName: game.gameName,
        payerId: txData.payId,
        receiverId: txData.receiverId,
        amount: txData.amount,
        status: "Pending"
      });
      transactionObjects.push(newTransaction);
    }

    for (const transaction of transactionObjects) {
      await transaction.save();
    }

    // marks the game as completed.
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
  getGameResults,
  endGame
};
