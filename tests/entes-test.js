
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Replace with a valid JWT token obtained from your login endpoint
const JWT_TOKEN = 'your_jwt_token';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`
    }
});

async function runTests() {
    try {
        await testGetAllEntes();
        await testGetEnteById('some_id'); // Replace with a valid ID
        await testCreateEnte();
        await testUpdateEnte('some_id'); // Replace with a valid ID
        await testDeleteEnte('some_id'); // Replace with a valid ID
    } catch (error) {
        console.error('Error running tests:', error.message);
    }
}

async function testGetAllEntes() {
    try {
        console.log('--- Testing GET /entes ---');
        const response = await axiosInstance.get('/entes');
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

async function testGetEnteById(id) {
    try {
        console.log(`--- Testing GET /entes/${id} ---`);
        const response = await axiosInstance.get(`/entes/${id}`);
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

async function testCreateEnte() {
    try {
        console.log('--- Testing POST /entes ---');
        const newEnte = {
            // Add required fields for creating an ente
            nombre: 'New Ente',
            tipo: 'cliente'
        };
        const response = await axiosInstance.post('/entes', newEnte);
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

async function testUpdateEnte(id) {
    try {
        console.log(`--- Testing PUT /entes/${id} ---`);
        const updatedEnte = {
            // Add fields to update
            nombre: 'Updated Ente'
        };
        const response = await axiosInstance.put(`/entes/${id}`, updatedEnte);
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

async function testDeleteEnte(id) {
    try {
        console.log(`--- Testing DELETE /entes/${id} ---`);
        const response = await axiosInstance.delete(`/entes/${id}`);
        console.log('Response:', response.status);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

runTests();
