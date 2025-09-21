import 'reflect-metadata';
import 'express-async-handler';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import morgan from 'morgan';
import Logger from './config/logger';
import { db } from './config/firebase';
import container from './config/container';
import { TYPES } from './config/types';

// --- DEPENDENCY INJECTION ---
import { AuthController } from './infrastructure/http/auth.controller';
import { EnteController } from './infrastructure/http/ente.controller';

// --- ROUTING ---
import { createAuthRouter } from './routes/auth';
import { createEnteRouter } from './routes/entes';
import contentRouter from './routes/content';

// --- MIDDLEWARE & UTILS ---
import { authMiddleware } from './middleware/authMiddleware';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { handleSuccess } from './utils/responseHandler';
import asyncHandler from 'express-async-handler';

const app = express();

// --- CORE MIDDLEWARE ---
app.use(express.json());

// --- HTTP REQUEST LOGGING ---
const stream = {
    write: (message: string) => Logger.http(message.trim()),
};
app.use(morgan('combined', { stream }));

// --- SWAGGER DOCUMENTATION ---
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Hexagonal Architecture API (Node.js/Express)',
            version: '1.0.0',
            description: 'API con arquitectura hexagonal, IA y principios SOLID.'
        },
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
            },
        },
    },
    apis: ['./src/routes/*.ts', './src/index.ts'], 
};
const openapiSpecification = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

// --- OBTENER CONTROLADORES DEL CONTENEDOR ---
const authController = container.get<AuthController>(TYPES.AuthController);
const enteController = container.get<EnteController>(TYPES.EnteController);

// --- ROUTE DEFINITIONS ---
app.use('/auth', createAuthRouter(authController));
app.get('/', (req, res) => handleSuccess(res, { message: 'Welcome to the Hexagonal API!' }));
app.get('/health', (req, res) => handleSuccess(res, { status: 'ok' }));

// --- RUTAS PROTEGIDAS ---
const apiRouter = express.Router();
apiRouter.use(authMiddleware); // Middleware de autenticación para todas las rutas /api

apiRouter.use('/content', contentRouter);
apiRouter.use('/entes', createEnteRouter(enteController)); // Correctly injected router

apiRouter.get('/test-db', asyncHandler(async (req, res) => {
    await db.collection('test').doc('health-check').set({ status: 'ok', timestamp: new Date() });
    handleSuccess(res, { message: 'Successfully connected to and wrote to Firestore!' });
}));

app.use('/api', apiRouter);

// --- ERROR HANDLING MIDDLEWARE ---
app.use(notFoundHandler);
app.use(errorHandler);

// --- SERVER STARTUP ---
const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
    Logger.info(`Server running on http://localhost:${port}`);
    Logger.info(`API Docs available at http://localhost:${port}/api-docs`);
});
