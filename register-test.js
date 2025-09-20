const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testRegister() {
  try {
    console.log('Attempting to register user: test@example.com');

    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      email: 'test@example.com',
      password: 'password123',
      nombre: 'Test User',
      telefono: '123456789',
      companiaCorretajeId: 'a8d6a2d9-14a8-4366-9e9f-31a8e181c479'
    });

    if (response.status === 200) {
      console.log('\x1b[32m%s\x1b[0m', 'User registered successfully!');
      console.log('User data:', response.data);
    } else {
      console.error('\x1b[31m%s\x1b[0m', 'Registration failed. Unexpected response:');
      console.error(response.data);
    }

  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Registration request failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Ejecutar la prueba
testRegister();
