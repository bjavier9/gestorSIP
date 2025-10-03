require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function getAppToken() {
  const secret = process.env.TEST_SECRET;
  if (!secret) {
    console.error('TEST_SECRET is not configured.');
    return null;
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/test-token`, { secret });
    return response.data.data.token;
  } catch (error) {
    console.error('Failed to generate test token:', error.response ? error.response.data : error.message);
    return null;
  }
}

async function testAuthInfo() {
  const token = await getAppToken();
  if (!token) {
    console.error('Cannot continue without a valid token.');
    return false;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/api/auth/info`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.status === 200 && response.data.data.projectId) {
      console.log('Successfully retrieved auth info:', response.data.data.projectId);
      return true;
    }
    console.error('Failed to retrieve auth info:', response.data);
    return false;
  } catch (error) {
    console.error('Error calling auth info endpoint:', error.response ? error.response.data : error.message);
    return false;
  }
}

testAuthInfo();
