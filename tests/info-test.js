const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testAuthInfo() {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/info`);
    if (response.status === 200 && response.data.data.projectId) {
      console.log('Successfully retrieved auth info:', response.data.data.projectId);
      return true;
    } else {
      console.error('Failed to retrieve auth info:', response.data);
      return false;
    }
  } catch (error) {
    console.error('Error calling auth info endpoint:', error.message);
    return false;
  }
}

testAuthInfo();
