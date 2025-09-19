const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testLogin() {
  try {
    console.log('Attempting to log in with user: test@example.com');

    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123',
    });

    if (response.status === 200 && response.data.data.token) {
      console.log('\x1b[32m%s\x1b[0m', 'Login successful!'); // Green text
      console.log('Received JWT Token:', response.data.data.token);
      
      // Devolver el token para que pueda ser usado en pruebas posteriores
      return response.data.data.token;
    } else {
      console.error('\x1b[31m%s\x1b[0m', 'Login failed. Unexpected response:'); // Red text
      console.error(response.data);
    }

  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Login request failed:'); // Red text
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Ejecutar la prueba
testLogin();
