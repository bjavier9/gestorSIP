require('dotenv').config();
const axios = require('axios');

// Constants for logging
const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';

// API Base URL - Make sure this matches your running server port
const API_BASE_URL = 'http://localhost:3000/api';

// Helper functions for logging
const printSuccess = (message) => console.log(`${GREEN}✓ ${message}${RESET}`);
const printError = (message, error) => {
    console.error(`${RED}✗ ${message}${RESET}`);
    if (error && error.response && error.response.data) {
        console.error(`${YELLOW}  [DETAILS] -> Status: ${error.response.status} | Code: ${error.response.data.code} | Message: ${error.response.data.message}${RESET}`);
    } else if (error) {
        console.error(`${YELLOW}  [RAW_ERROR] -> ${error.message}${RESET}`);
    }
};

// --- Token Acquisition ---
async function getSuperAdminToken() {
    try {
        console.log(`\n${CYAN}--- Acquiring Super Admin token... ---${RESET}`);
        const response = await axios.post(`${API_BASE_URL}/auth/login/superadmin`, {
            email: process.env.SUPERADMIN_EMAIL,
            password: process.env.SUPERADMIN_PASSWORD,
        });
        if (response.data.data.token) {
            printSuccess("Super Admin token acquired successfully.");
            return response.data.data.token;
        }
        throw new Error("Token not found in Super Admin response.");
    } catch (error) {
        printError("Failed to acquire Super Admin token.", error);
        throw new Error("Could not get Super Admin token. Halting tests.");
    }
}

async function getRegularUserToken() {
     try {
        console.log(`\n${CYAN}--- Acquiring Regular User token... ---${RESET}`);
        const response = await axios.post(`${API_BASE_URL}/auth/test-token`, {
            secret: process.env.TEST_SECRET,
        });
        if (response.data.data.token) {
            printSuccess("Regular user token acquired successfully.");
            return response.data.data.token;
        }
        throw new Error("Token not found in test-token response.");
    } catch (error) {
        printError("Failed to acquire regular user token.", error);
        throw new Error("Could not get regular user token. Halting tests.");
    }
}

// --- Main Test Runner ---
async function runCompaniaCorretajeTests() {
    console.log(`\n${CYAN}====== RUNNING COMPAÑÍA DE CORRETAJE E2E TESTS ======${RESET}`);
    
    // 1. Get tokens before starting
    let superAdminToken, regularUserToken;
    try {
        superAdminToken = await getSuperAdminToken();
        regularUserToken = await getRegularUserToken();
    } catch(e) {
        printError("Could not acquire necessary tokens. Aborting tests.", e);
        return; // Exit if we can't get tokens
    }

    const superAdminConfig = { headers: { Authorization: `Bearer ${superAdminToken}` } };
    const regularUserConfig = { headers: { Authorization: `Bearer ${regularUserToken}` } };

    const uniqueRif = `J-TEST-${Date.now()}`;
    const newCompanyData = {
        nombre: 'Compañía de Prueba E2E Completa',
        rif: uniqueRif,
        direccion: 'Calle Ficticia 123, Ciudad Prueba',
        telefono: '+1-555-1234567',
        correo: `test-${Date.now()}@example.com`,
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
        activo: true,
        creada: { idente: 999 }, // Test user ID
        modificado: [
            {
                idente: 999,
                fechaActualizacion: new Date().toISOString()
            }
        ],
        monedasAceptadas: ['USD', 'EUR'],
        monedaPorDefecto: 'USD',
        modulos: ['gestion_poliza', 'reporteria']
    };

    let createdCompanyId = null;

    // --- Test Cases ---

    // Test 1: Fail without an auth token
    try {
        console.log(`\n${CYAN}--- Test 1: Fail without auth token (401 Unauthorized) ---${RESET}`);
        await axios.post(`${API_BASE_URL}/companias`, newCompanyData);
        printError("Test Failed: Server should have returned 401 Unauthorized, but the request succeeded.");
    } catch (error) {
        if (error.response && error.response.status === 401) {
            printSuccess("Test Passed: Server correctly returned 401 Unauthorized.");
        } else {
            printError("Test Failed: Did not receive 401 Unauthorized as expected.", error);
        }
    }

    // Test 2: Fail to create with a regular user token
    try {
        console.log(`\n${CYAN}--- Test 2: Fail with regular user token (403 Forbidden) ---${RESET}`);
        await axios.post(`${API_BASE_URL}/companias`, newCompanyData, regularUserConfig);
        printError("Test Failed: Server should have returned 403 Forbidden, but the request succeeded.");
    } catch (error) {
        if (error.response && error.response.status === 403) {
            printSuccess("Test Passed: Server correctly returned 403 Forbidden.");
        } else {
            printError("Test Failed: Did not receive 403 Forbidden as expected.", error);
        }
    }

    // Test 3: Fail with missing 'nombre'
    try {
        console.log(`\n${CYAN}--- Test 3: Fail with missing 'nombre' (400 Bad Request) ---${RESET}`);
        const { nombre, ...dataSinNombre } = newCompanyData;
        await axios.post(`${API_BASE_URL}/companias`, dataSinNombre, superAdminConfig);
        printError("Test Failed: Server should have returned 400 Bad Request, but succeeded.");
    } catch (error) {
        if (error.response && error.response.status === 400) {
            printSuccess("Test Passed: Server correctly returned 400 Bad Request for missing 'nombre'.");
        } else {
            printError("Test Failed: Did not receive 400 Bad Request as expected.", error);
        }
    }

    // Test 4: Create company successfully with complete data
    try {
        console.log(`\n${CYAN}--- Test 4: Create a new company successfully with complete data (201 Created) ---${RESET}`);
        const response = await axios.post(`${API_BASE_URL}/companias`, newCompanyData, superAdminConfig);
        const createdCompany = response.data.data;

        if (response.status === 201 &&
            createdCompany.rif === uniqueRif &&
            createdCompany.nombre === newCompanyData.nombre &&
            createdCompany.correo === newCompanyData.correo &&
            createdCompany.modulos.includes('reporteria')
        ) {
            printSuccess("Test Passed: Company created successfully with status 201 and all data is correct.");
            createdCompanyId = createdCompany.id;
        } else {
            printError(`Test Failed: Expected status 201 and correct data, but got status ${response.status}.`);
            console.log('Expected subset:', {nombre: newCompanyData.nombre, rif: newCompanyData.rif, correo: newCompanyData.correo});
            console.log('Received:', createdCompany);
        }
    } catch (error) {
        printError("Test Failed: The successful creation of a company failed unexpectedly.", error);
    }
    
    // Test 5: Fail with duplicate RIF
    if (createdCompanyId) {
        try {
            console.log(`\n${CYAN}--- Test 5: Fail with duplicate RIF (409 Conflict) ---${RESET}`);
            await axios.post(`${API_BASE_URL}/companias`, newCompanyData, superAdminConfig);
            printError("Test Failed: Server should have returned 409 Conflict, but the request succeeded.");
        } catch (error) {
            if (error.response && error.response.status === 409) {
                printSuccess("Test Passed: Server correctly returned 409 Conflict for duplicate RIF.");
            } else {
                printError("Test Failed: Did not receive 409 Conflict as expected for duplicate RIF.", error);
            }
        }
    } else {
        console.log(`${YELLOW}Skipping duplicate RIF test because the initial creation failed.${RESET}`);
    }

    console.log(`${CYAN}\n====== COMPAÑÍA DE CORRETAJE TESTS FINISHED ======${RESET}`);
    console.log(`${YELLOW}NOTE: Cleanup (deletion) is not part of this test as a DELETE endpoint was not requested.${RESET}`);

}

// --- Main Execution ---
runCompaniaCorretajeTests();
