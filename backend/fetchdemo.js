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
      return data.token;
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
  
    // User details
    const user1 = { username: "user1", email: "user1@example.com", password: "password1" };
    const user2 = { username: "user2", email: "user2@example.com", password: "password2" };
    const user3 = { username: "user3", email: "user3@example.com", password: "password3" };
  
    try {
      // Register users
      console.log("Registering users...");
      await registerUser(user1);
      await registerUser(user2);
      await registerUser(user3);
  
      // Login users and get their tokens
      console.log("Logging in users...");
      const token1 = await loginUser({ email: user1.email, password: user1.password });
      const token2 = await loginUser({ email: user2.email, password: user2.password });
      const token3 = await loginUser({ email: user3.email, password: user3.password });
      
      console.log("Tokens received:");
      console.log({ token1, token2, token3 });
  
      // Send friend requests from user1 to user2 and user3
      console.log("User1 sending friend requests to user2 and user3...");
      await sendFriendRequest(token1, user2.username);
      await sendFriendRequest(token1, user3.username);
  
      // Accept friend requests (user2 and user3 accepting user1's request)
      console.log("User2 and user3 accepting friend request from user1...");
      await acceptFriendRequest(token2, user1.username);
      await acceptFriendRequest(token3, user1.username);
  
      // User1 sends a game invite to user2 and user3
      console.log("User1 sending a game invite to user2 and user3...");
      // Note: mode is set to "Strokeplay" as per the provided endpoints.
      await sendGameInvite(token1, [user2.username, user3.username], 50, "Strokeplay", "Newgame", "Newcourse");
  
      // User2 and user3 accept the game invite
      console.log("User2 and user3 accepting the game invite...");
      await acceptGameInvite(token2, user1.username);
      await acceptGameInvite(token3, user1.username);
  
      console.log("All operations completed successfully.");
    } catch (error) {
      console.error("An error occurred:", error);
    }
  })();
  