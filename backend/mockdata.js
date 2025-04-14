(async function() {
  // Helper functions for API calls
  async function registerUser({ username, email, password }) {
    const res = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    return res.json();
  }

  async function loginUser({ email, password }) {
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    return data;
  }

  async function sendFriendRequest(token, friendUsername) {
    const res = await fetch('http://localhost:3000/api/friends', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ username: friendUsername })
    });
    return res.json();
  }

  async function acceptFriendRequest(token, senderUsername) {
    const res = await fetch('http://localhost:3000/api/friends/accept', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ username: senderUsername })
    });
    return res.json();
  }

  async function sendGameInvite(token, receiverUsernames, stake, mode, name, course) {
    const res = await fetch('http://localhost:3000/api/invite', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        receiverUsernames,
        stake,
        mode,
        name,
        course
      })
    });
    return res.json();
  }

  async function acceptGameInvite(token, senderUsername) {
    const res = await fetch('http://localhost:3000/api/invite/accept', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ username: senderUsername })
    });
    return res.json();
  }

  async function updateGameScore(token, gameName, hole, score) {
    const res = await fetch('http://localhost:3000/api/game/update', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ gameName, hole, score })
    });
    return res.json();
  }

  async function getResults(token, gameName) {
    const res = await fetch(`http://localhost:3000/api/game/results/${encodeURIComponent(gameName)}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return res.json();
  }  

  async function endGame(token, gameName) {
    const res = await fetch('http://localhost:3000/api/game/end', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ gameName })
    });
    return res.json();
  }

  // Create 10 users: user1 through user10
  const users = [];
  for (let i = 1; i <= 10; i++) {
    users.push({ 
      username: `user${i}`, 
      email: `user${i}@example.com`, 
      password: `password${i}` 
    });
  }

  try {
    // Register users
    console.log("Registering users...");
    for (let user of users) {
      await registerUser(user);
    }

    console.log("Logging in users...");
    const tokens = [];
    const refreshTokens = [];  // Array to store refresh tokens
    for (let user of users) {
      const loginResult = await loginUser({ email: user.email, password: user.password });
      tokens.push(loginResult.accessToken);
      refreshTokens.push(loginResult.refreshToken);
    }
    console.log("Access Tokens received:", tokens);

    // Player 1 sends friend requests to players 2 to 10
    console.log("Player1 sending friend requests to players 2 to 10...");
    for (let i = 1; i < users.length; i++) {
      await sendFriendRequest(tokens[0], users[i].username);
    }

    // Players 2 to 10 accept the friend request from player1
    console.log("Players 2 to 10 accepting friend request from player1...");
    for (let i = 1; i < users.length; i++) {
      await acceptFriendRequest(tokens[i], users[0].username);
    }

    // Player1 sends a game invite to players 2 to 10
    console.log("Player1 sending a game invite to players 2 to 10...");
    const receiverUsernames = users.slice(1).map(user => user.username);
    // Note: mode is set to "Strokeplay"
    await sendGameInvite(tokens[0], receiverUsernames, 30, "Strokeplay", "Newgame", "Newcourse");

    // Players 2 to 10 accept the game invite from player1
    console.log("Players 2 to 10 accepting the game invite from player1...");
    for (let i = 1; i < users.length; i++) {
      await acceptGameInvite(tokens[i], users[0].username);
    }

    // Update game scores for each hole for all 10 players
    console.log("Updating game scores for each hole for all players...");
    const totalHoles = 18;
    for (let hole = 1; hole <= totalHoles; hole++) {
      const scores = [];
      for (let i = 0; i < users.length; i++) {
        // Generate random score between 1 and 10 for each player
        const score = Math.floor(Math.random() * 10) + 1;
        scores.push(score);
        await updateGameScore(tokens[i], "Newgame", hole, score);
      }
      console.log(`Hole ${hole} scores:`, scores);
    }

    console.log("Player 1 getting results...");
    const endResult = await getResults(tokens[0], "Newgame");
    console.log("Game results:", endResult);

    console.log("Player 1 ending the game...");
    const transactions = await endGame(tokens[0], "Newgame");
    console.log("Game results:", transactions);

    console.log("Refresh Tokens Array:", refreshTokens);

    console.log("All operations completed successfully.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();
