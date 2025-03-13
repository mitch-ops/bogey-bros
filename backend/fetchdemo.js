import fetch from 'node-fetch';

const registerData = {
  username: 'testUser',
  email: 'testuser@example.com',
  password: 'password123'
};

const registerData2 = {
  username: 'testUser2',
  email: 'testuser2@example.com',
  password: 'password1234'
};

let token = '';
let token2 = '';

// Register a new user
const registerUsers = async () => {
  try {
    const response = await fetch('https://bogey-bros.onrender.com/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });
    const data = await response.json();
    console.log('Register Response:', data);
    if (data.message === 'User registered successfully') {
      console.log('User registered successfully!');
    } else {
      console.log('Registration error:', data.message);
    }
    const response2 = await fetch('https://bogey-bros.onrender.com/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData2)
    });
    const data2 = await response2.json();
    console.log('Register Response:', data2);
    if (data2.message === 'User registered successfully') {
      console.log('User registered successfully!');
    } else {
      console.log('Registration error:', data2.message);
    }
  } catch (error) {
    console.error('Error registering user:', error);
  }
};

// Login user and get token
const loginUsers = async () => {
  try {
    const response = await fetch('https://bogey-bros.onrender.com/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: registerData.email,
        password: registerData.password
      })
    });
    const data = await response.json();
    if (data.token) {
      token = data.token;
      console.log('Login successful! Token:', token);
    } else {
      console.log('Invalid credentials');
    }
    const response2 = await fetch('https://bogey-bros.onrender.com/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: registerData2.email,
        password: registerData2.password
      })
    });
    const data2 = await response2.json();
    if (data2.token) {
      token2 = data2.token;
      console.log('Login successful! Token:', token2);
    } else {
      console.log('Invalid credentials');
    }
  } catch (error) {
    console.error('Error logging in:', error);
  }
};

// Get user info by username
const getUserInfo = async () => {
  if (!token) {
    console.log('Please log in first!');
    return;
  }
  try {
    const response = await fetch(`https://bogey-bros.onrender.com/api/users/${registerData.email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    console.log('User Info:', data);
  } catch (error) {
    console.error('Error fetching user info:', error);
  }
};

const updateUserInfo = async () => {
  if (!token) {
    console.log('Please log in first!');
    return;
  }
  try {
    const response = await fetch(`https://bogey-bros.onrender.com/api/users/${registerData.email}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        handicap: 10,
        stats: {
          strokeplay: {
            roundsPlayed: 20,
            wins: 15,
            losses: 5,
            averageScore: 68
          },
          matchplay: {
            roundsPlayed: 10,
            wins: 7,
            losses: 3
          }
        }
      })
    });
    const data = await response.json();
    console.log('Updated User Info:', data);
  } catch (error) {
    console.error('Error updating user info:', error);
  }
};

const sendFriendRequest = async () => {
  const response = await fetch('https://bogey-bros.onrender.com/api/friends/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ username: 'testUser2' })
  });

  const data = await response.json();
  console.log('Friend Request Response:', data);
};

const acceptFriendRequest = async () => {
  try {
    // Step 1: Fetch pending friend requests to get the request ID
    const requestsResponse = await fetch("https://bogey-bros.onrender.com/api/friends/requests", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token2}` // Use stored token
      }
    });

    console.log("Getting user 2 friend requests...");

    const requests = await requestsResponse.json();
    if (!requests.length) {
      console.log("No pending friend requests.");
      return;
    }

    const requestId = requests[0]._id; // Pick the first request (you can change logic if needed)
    console.log("Accepting Friend Request ID:", requestId);

    // Step 2: Accept the friend request
    const response = await fetch(`https://bogey-bros.onrender.com/api/friends/accept/${requestId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token2}`
      }
    });

    const data = await response.json();
    console.log("Accept Friend Request Response:", data);
  } catch (error) {
    console.error("Error accepting friend request:", error);
  }
};

// Delete user by email
const deleteUsers = async () => {
  if (!token) {
    console.log('Please log in first!');
    return;
  }
  try {
    const response = await fetch(`https://bogey-bros.onrender.com/api/users/${registerData.email}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    console.log('Delete Response:', data);
    const response2 = await fetch(`https://bogey-bros.onrender.com/api/users/${registerData2.email}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token2}`
      }
    });
    const data2 = await response2.json();
    console.log('Delete Response:', data2);
  } catch (error) {
    console.error('Error deleting user:', error);
  }
};

const main = async () => {
  console.log('Registering users...');
  await registerUsers();
  console.log('\nLogging in...');
  await loginUsers();
  console.log('\nFetching user 1 info...');
  await getUserInfo();
  console.log('\nUpdating user 1 info...');
  await updateUserInfo();
  console.log('\nCreating friend request from user 1 to user 2...');
  await sendFriendRequest();
  console.log('\nUser 2 accepting friend request..')
  await acceptFriendRequest();
  console.log('\nDeleting users...');
  await deleteUsers();
};

main();
