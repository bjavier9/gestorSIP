import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

const initializeFirebase = () => {
  // The SDK will automatically find the credentials via the GOOGLE_APPLICATION_CREDENTIALS
  // environment variable if it's set. Otherwise, it will look for other options.
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    console.log('\n');
    console.log('************************************************************************************************');
    console.log('** PLEASE MAKE SURE YOU HAVE FOLLOWED THESE STEPS:                                           **');
    console.log('** 1. Go to your Firebase project settings.                                                   **');
    console.log('** 2. Go to the \'Service accounts\' tab.                                                      **');
    console.log('** 3. Click \'Generate new private key\' and download the JSON file.                          **');
    console.log('** 4. Create a file named .env in your project root.                                          **');
    console.log('** 5. Add this line to it: GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/downloaded-key.json **');
    console.log('************************************************************************************************');
    process.exit(1); // Exit if Firebase can't be initialized
  }
};

initializeFirebase();

const db = admin.firestore();

export { db };
