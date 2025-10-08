import admin from 'firebase-admin';
import logger from './logger';

let db: admin.firestore.Firestore;

// Función para procesar de forma segura la clave privada desde las variables de entorno
const getFirebasePrivateKey = (): string => {
    if (!process.env.FIREBASE_PRIVATE_KEY) {
        throw new Error('La variable de entorno FIREBASE_PRIVATE_KEY no está configurada.');
    }
    // En algunos entornos (como los archivos .env), los saltos de línea en la clave
    // pueden estar escapados como \n. Los reemplazamos por saltos de línea reales.
    return process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
};

export const initializeFirebase = () => {
    let initialized = false;

    // --- Método 1: Inicializar con Variables de Entorno (Recomendado) ---
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        try {
            const serviceAccount: admin.ServiceAccount = {
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: getFirebasePrivateKey(),
            };

            if (admin.apps.length === 0) {
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
            }
            logger.info('Firebase Admin SDK inicializado con éxito usando variables de entorno.');
            initialized = true;
        } catch (error: any) {
            logger.error('CRÍTICO: Fallo al inicializar Firebase usando variables de entorno.');
            logger.error(`Detalles del error: ${error?.message || error}`);
        }
    }

    // --- Método 2: Respaldo con firebase-credentials.json (Desarrollo Local) ---
    if (!initialized) {
        try {
            const serviceAccount = require('../../firebase-credentials.json');

            // Verifica si el archivo de credenciales está vacío
            if (!serviceAccount || Object.keys(serviceAccount).length === 0) {
                 throw new Error('El archivo firebase-credentials.json está vacío o no es válido.');
            }

            if (admin.apps.length === 0) {
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
            }
            logger.warn('Firebase Admin SDK se inicializó usando el archivo firebase-credentials.json como respaldo.');
            initialized = true;
        } catch (error: any) {
            logger.error('CRÍTICO: Fallo al inicializar Firebase usando todos los métodos disponibles.');
            logger.error('Asegúrate de que las variables de entorno estén configuradas o que `firebase-credentials.json` sea válido.');
            logger.error(`Detalles del error: ${error?.message || error}`);
            process.exit(1); // Salir si todos los métodos fallan
        }
    }

    db = admin.firestore();
    logger.info('Firebase ha sido inicializado y la base de datos está disponible.');
};

export { db };
