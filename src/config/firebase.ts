import admin from 'firebase-admin';
import logger from './logger';

let db: admin.firestore.Firestore;

export const initializeFirebase = () => {
  try {
    const serviceAccount = require('../../firebase-credentials.json');

    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }

    logger.info('Firebase Admin SDK initialized successfully using firebase-credentials.json.');
  } catch (error: any) {
    logger.error('CRITICAL: Failed to initialize Firebase using firebase-credentials.json.');
    logger.error('Please ensure that `firebase-credentials.json` exists in the project root directory.');
    logger.error(`Error details: ${error?.message || error}`);
    process.exit(1);
  }

  db = admin.firestore();
  logger.info('Firebase has been initialized and database is available.');
};

export { db };
