import fetch from 'node-fetch';

const registerData = {
  username: 'testUser',
  email: 'testuser@example.com',
  password: 'password123'
};

let token = '';

// Register a new user
const registerUser = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/register', {
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
  } catch (error) {
    console.error('Error registering user:', error);
  }
};

// Login user and get token
const loginUser = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: registerData.email,
        password: registerData.password
      })
    });
    const data = await response.json();
    console.log('Login Response:', data);
    if (data.token) {
      token = data.token;
      console.log('Login successful! Token:', token);
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
    const response = await fetch(`http://localhost:3000/api/users/${registerData.email}`, {
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
    const response = await fetch(`http://localhost:3000/api/users/${registerData.email}`, {
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

// Delete user by email
const deleteUser = async () => {
  if (!token) {
    console.log('Please log in first!');
    return;
  }
  try {
    const response = await fetch(`http://localhost:3000/api/users/${registerData.email}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    console.log('Delete Response:', data);
  } catch (error) {
    console.error('Error deleting user:', error);
  }
};

const main = async () => {
  console.log('Registering user...');
  await registerUser();
  console.log('\nLogging in...');
  await loginUser();
  console.log('\nFetching user info...');
  await getUserInfo();
  console.log('\nUpdating user info...');
  await updateUserInfo();
  console.log('\nDeleting user...');
  await deleteUser();
};

main();
