// deleteUsers.js
const BASE_URL = 'http://localhost:3000';

async function loginAndGetToken(email, password) {
  const response = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(`Login failed for ${email} - HTTP status ${response.status}`);
  }

  const data = await response.json();
  // Adjust based on how your API returns the token. For example:
  // if data = { token: '...' } then do:
  const token = data.token; 
  // If your API uses a different property name, adjust accordingly.

  if (!token) {
    throw new Error(`No token returned for ${email}`);
  }

  return token;
}

async function deleteUser(token, email) {
  const response = await fetch(`${BASE_URL}/api/user`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Delete failed for ${email} - HTTP status ${response.status}`);
  }

  const data = await response.json();
  return data;
}

(async function main() {
  const users = [
    { email: 'user1@example.com', password: 'password1' },
    { email: 'user2@example.com', password: 'password2' },
    { email: 'user3@example.com', password: 'password3' },
  ];

  for (const { email, password } of users) {
    try {
      console.log(`Logging in as ${email}...`);
      const token = await loginAndGetToken(email, password);
      console.log(`Deleting user ${email}...`);
      const result = await deleteUser(token, email);
      console.log(`Success:`, result);
    } catch (err) {
      console.error(`Error handling user ${email}:`, err.message);
    }
  }
})();
