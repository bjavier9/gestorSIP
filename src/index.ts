// Initialize Firebase Admin SDK by importing the config
import { db } from './config/firebase';

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My Express API with Swagger and Firestore',
      version: '1.0.0',
    },
  },
  apis: ['./src/index.ts'], // files containing annotations as above
};

const openapiSpecification = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

/**
 * @swagger
 * /:
 *   get:
 *     description: Returns a greeting
 *     responses:
 *       200:
 *         description: A greeting message
 */
app.get('/', (req, res) => {
  const name = process.env.NAME || 'World';
  res.send(`Hello ${name}!`);
});

/**
 * @swagger
 * /health:
 *   get:
 *     description: Returns the health status of the service
 *     responses:
 *       200:
 *         description: The service is healthy
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * @swagger
 * /api/test-db:
 *   get:
 *     summary: Test Firestore connection
 *     description: Writes a test document to the 'test' collection in Firestore. This will fail if your service account is not configured correctly.
 *     responses:
 *       200:
 *         description: Successfully wrote to Firestore.
 *       500:
 *         description: Failed to write to Firestore. Check server logs for details on the credential error.
 */
app.get('/api/test-db', async (req, res) => {
  try {
    const docRef = db.collection('test').doc('hello-world');
    await docRef.set({
      message: 'Hello from the API!',
      timestamp: new Date()
    });
    res.status(200).json({ message: 'Successfully wrote to Firestore!' });
  } catch (error) {
    // The error from firebase.ts already provides guidance in the console
    res.status(500).json({ error: 'Failed to write to Firestore. Check server logs for credential details.' });
  }
});

const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
