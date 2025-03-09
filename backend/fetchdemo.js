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
    const response = await fetch(`http://localhost:3000/api/users/${registerData.username}`, {
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

const main = async () => {
  console.log('Registering user...');
  await registerUser();
  console.log('\nLogging in...');
  await loginUser();
  console.log('\nFetching user info...');
  await getUserInfo();
};

main();
