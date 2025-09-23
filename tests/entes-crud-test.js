const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// --- Colores para la consola ---
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';

// --- Funciones de Ayuda ---

/**
 * Imprime un mensaje de éxito en la consola.
 */
function printSuccess(message) {
  console.log(`${GREEN}${message}${RESET}`);
}

/**
 * Imprime un mensaje de error en la consola.
 */
function printError(message, error) {
  console.error(`${RED}${message}${RESET}`);
  if (error) {
    const errorData = error.response ? error.response.data : { message: error.message };
    console.error(JSON.stringify(errorData, null, 2));
  }
}

/**
 * Obtiene el token de autenticación de la app.
 */
async function getAppToken() {
  try {
    // 1. Autenticar con nuestra API
    const appResponse = await axios.post(`http://localhost:3000/auth/test-token`, { secret: process.env.TEST_SECRET });
    printSuccess('Authentication successful.');
    return appResponse.data.data.token;
  } catch (error) {
    printError('Authentication failed.', error);
    return null;
  }
}

// --- Pruebas del CRUD de Entes ---
async function runEnteCrudTests() {
  console.log(`${CYAN}--- Iniciando Pruebas CRUD para /entes ---${RESET}`);
  const token = await getAppToken();

  if (!token) {
    printError('No se pudo obtener el token. Abortando pruebas del CRUD.');
    return;
  }

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
  let enteId = null; // Para guardar el ID del ente que creemos

  // 1. Prueba de CREAR (POST)
  try {
    console.log(`\n${CYAN}--- Paso 1: Creando un nuevo ente... ---${RESET}`);
    const nuevoEnte = {
        nombre: 'Ente de Prueba CRUD',
        tipo: 'Persona Natural',
        documento: `V-CRUD-${Date.now()}`,
        tipo_documento: 'V',
        direccion: 'Caracas, Venezuela',
        telefono: '0412-9998877',
        correo: 'crud.test@example.com',
        idregion: 1,
        idReferido: null,
        activo: true,
        metadatos: {
            creadoPor: 'test-suite',
            fechaNacimiento: new Date('1990-01-01'),
            genero: 'M',
            estadoCivil: 'Soltero/a',
            profesion: 'Ingeniero',
            nacionalidad: 'Venezolano',
        }
    };
    const response = await axios.post(`${API_BASE_URL}/entes`, nuevoEnte, axiosConfig);

    if (response.status === 201 && response.data.id) {
      printSuccess('Ente creado exitosamente!');
      enteId = response.data.id;
      console.log('ID del nuevo ente:', enteId);
    } else {
      printError('La respuesta de creación no fue la esperada.', response.data);
    }
  } catch (error) {
    printError('Falló la creación del ente.', error);
    return; // Si no podemos crear, no podemos seguir
  }

  // 2. Prueba de LEER (GET)
  try {
    console.log(`\n${CYAN}--- Paso 2: Obteniendo el ente creado... ---${RESET}`);
    const response = await axios.get(`${API_BASE_URL}/entes/${enteId}`, axiosConfig);
    if (response.status === 200 && response.data.id === enteId) {
      printSuccess('Ente obtenido exitosamente!');
      console.log('Datos:', response.data);
    } else {
      printError('La respuesta de obtención no fue la esperada.');
    }
  } catch (error) {
    printError('Falló la obtención del ente.', error);
  }

  // 3. Prueba de ACTUALIZAR (PUT)
  try {
    console.log(`\n${CYAN}--- Paso 3: Actualizando el ente... ---${RESET}`);
    const datosActualizados = { nombre: 'Ente de Prueba CRUD Actualizado' };
    const response = await axios.put(`${API_BASE_URL}/entes/${enteId}`, datosActualizados, axiosConfig);

    if (response.status === 200 && response.data.nombre === datosActualizados.nombre) {
      printSuccess('Ente actualizado exitosamente!');
      console.log('Datos actualizados:', response.data);
    } else {
      printError('La respuesta de actualización no fue la esperada.');
    }
  } catch (error) {
    printError('Falló la actualización del ente.', error);
  }

  // 4. Prueba de ELIMINAR (DELETE)
  try {
    console.log(`\n${CYAN}--- Paso 4: Eliminando el ente... ---${RESET}`);
    const response = await axios.delete(`${API_BASE_URL}/entes/${enteId}`, axiosConfig);
    if (response.status === 204) {
      printSuccess('Ente eliminado exitosamente!');
    } else {
      printError('La respuesta de eliminación no fue la esperada.');
    }
  } catch (error) {
    printError('Falló la eliminación del ente.', error);
  }

  // 5. Verificación final: Asegurarse de que el ente ya no existe
  try {
    console.log(`\n${CYAN}--- Paso 5: Verificando que el ente no exista... ---${RESET}`);
    await axios.get(`${API_BASE_URL}/entes/${enteId}`, axiosConfig);
    // Si la llamada tiene éxito, es un error, porque el ente debería haber sido borrado
    printError('Error de verificación: El ente todavía existe, pero debería haber sido eliminado.');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      printSuccess('Verificación exitosa: El endpoint retornó 404 Not Found, como se esperaba.');
    } else {
      printError('La verificación de eliminación falló de forma inesperada.', error);
    }
  }

}

// --- Ejecución Principal ---
runEnteCrudTests();
