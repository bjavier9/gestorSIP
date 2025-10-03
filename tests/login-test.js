const axios = require('axios');

// Your Firebase Web API Key (it is safe to have this in a test script)
const FIREBASE_API_KEY = 'AIzaSyD6zReyecIiMKqNVbUe7d6bGKsO2Vlum3E';
const API_BASE_URL = 'http://localhost:3000';

// This is the endpoint for Firebase's REST API for email/password sign-in
const FIREBASE_AUTH_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;

/**
 * Gets a Firebase ID token by authenticating with Firebase's REST API.
 * @returns {Promise<string|null>} The Firebase ID token or null if failed.
 */
async function getFirebaseIdToken(email, password) {
  try {
    const response = await axios.post(FIREBASE_AUTH_URL, {
      email: email,
      password: password,
      returnSecureToken: true,
    });
    return response.data.idToken;
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Firebase Authentication failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data.error);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
}

/**
 * Tests the application's login endpoint.
 * @returns {Promise<string|null>} The application JWT or null if failed.
 */
async function testAppLogin() {
  const email = 'admin@seguroplus.com';
  const password = 'password123';

  console.log(`--- Running Test: /api/auth/login ---`);
  console.log(`Attempting to get Firebase ID token for user: ${email}`);
  const idToken = await getFirebaseIdToken(email, password);

  if (!idToken) {
    console.error('\x1b[31m%s\x1b[0m', 'Could not retrieve ID token. Aborting app login test.');
    return null;
  }

  console.log('Successfully got ID token. Now logging into our app...');

  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      idToken: idToken,
    });

    const { data } = response.data;

    if (response.status === 200 && data.token && data.companias) {
      console.log('\x1b[32m%s\x1b[0m', 'App Login successful!');
      console.log('Received JWT Token and company list.');
      console.log('\x1b[36m%s\x1b[0m', 'JWT Token:', data.token);
      console.log('Needs Selection:', data.needsSelection);
      console.log('Companies:', JSON.stringify(data.companias, null, 2));
      return data.token;
    } else {
      console.error('\x1b[31m%s\x1b[0m', 'App Login failed. Response did not contain token and companias:');
      console.error(response.data);
      return null;
    }
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'App Login request failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
}

// --- Main Execution ---
async function runTests() {
  await testAppLogin();
}

runTests();
