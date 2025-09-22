import admin from 'firebase-admin';

// 1. Declare la variable 'db' pero no la inicialice todavía.
// Será exportada, pero su valor será 'undefined' hasta que se inicialice Firebase.
let db: admin.firestore.Firestore;

/**
 * Inicializa el SDK de Firebase Admin y la conexión a Firestore.
 * Esta función DEBE ser llamada al inicio de la aplicación antes de cualquier operación de base de datos.
 */
const initializeFirebase = () => {
  // Evitar la reinicialización si ya se ha hecho
  if (admin.apps.length > 0) {
    db = admin.firestore(); // Asegurarse de que db esté asignada si ya estaba inicializada
    return;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

    console.log('Firebase Admin SDK initialized successfully.');

    // 2. Ahora que Firebase está inicializado, asigne la instancia de Firestore a 'db'.
    db = admin.firestore();

  } catch (error: any) {
    console.error('Error initializing Firebase Admin SDK:', error);
    // Log de ayuda para el desarrollador
    console.log('\n');
    console.log('************************************************************************************************');
    console.log('** PLEASE MAKE SURE YOU HAVE FOLLOWED THESE STEPS:                                           **');
    console.log('** 1. Go to your Firebase project settings.                                                   **');
    console.log('** 2. Go to the "Service accounts" tab.                                                     **');
    console.log('** 3. Click "Generate new private key" and download the JSON file.                            **');
    console.log('** 4. Set the environment variable GOOGLE_APPLICATION_CREDENTIALS to the path of this file.   **');
    console.log('**    (e.g., `export GOOGLE_APPLICATION_CREDENTIALS=\"/path/to/your/key.json\"`)                 **');
    console.log('** 5. Make sure the FIREBASE_PROJECT_ID environment variable is also set in your .env file.     **');
    console.log('************************************************************************************************\n');
    // Salir del proceso si Firebase no se puede inicializar, ya que la app no puede funcionar.
    process.exit(1); 
  }
};

// 3. Exporte tanto la función de inicialización como la variable 'db' (que ahora se llenará en el momento correcto).
export { initializeFirebase, db };
