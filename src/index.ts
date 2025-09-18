
import 'express-async-handler';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import morgan from 'morgan'; // Import morgan
import Logger from './config/logger'; // Import nuestro logger
import { db } from './config/firebase';

// --- DOMAIN & PORTS ---
import { Ente } from './domain/ente';
import { EnteInput } from './domain/ports/enteRepository.port';

// --- APPLICATION ---
import { AuthService } from './application/auth.service';
import { EnteService } from './application/ente.service';

// --- INFRASTRUCTURE ---
import { FirebaseUserRepository } from './infrastructure/persistence/firebaseUserRepository.adapter';
import { FirebaseEnteRepository } from './infrastructure/persistence/firebaseEnteRepository.adapter';
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

// --- DEPENDENCY INJECTION ---

// 1. Repositories (Adapters)
const userRepository = new FirebaseUserRepository();
const enteRepository = new FirebaseEnteRepository();

// 2. Application Services
const authService = new AuthService(userRepository, enteRepository); // Inyectar enteRepository
const enteService = new EnteService(enteRepository);

// 3. Controllers (Input Adapters)
const authController = new AuthController(authService);
const enteController = new EnteController(enteService);


// --- CORE MIDDLEWARE ---
app.use(express.json());

// --- HTTP REQUEST LOGGING ---
// Define un stream para que morgan use nuestro logger de Winston
const stream = {
    write: (message: string) => Logger.http(message.trim()),
};

// Usa morgan con el stream de Winston. El formato 'combined' es un estándar de Apache.
app.use(morgan('combined', { stream }));

// --- SWAGGER DOCUMENTATION ---
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Hexagonal Architecture API (Node.js/Express)',
            version: '1.0.0',
            description: 'API built with Express and TypeScript, following Hexagonal Architecture principles.'
        },
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
            },
            schemas: {
                Ente: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        nombre: { type: 'string' },
                        tipo: { type: 'string' },
                        direccion: { type: 'string' },
                        telefono: { type: 'string' },
                        correo: { type: 'string', format: 'email' },
                        fechaCreacion: { type: 'string', format: 'date-time' },
                        fechaActualizacion: { type: 'string', format: 'date-time' },
                        activo: { type: 'boolean' },
                    }
                },
                EnteInput: {
                    type: 'object',
                    required: ['nombre', 'tipo', 'correo'],
                    properties: {
                        nombre: { type: 'string' },
                        tipo: { type: 'string', example: 'Persona Natural' },
                        direccion: { type: 'string' },
                        telefono: { type: 'string' },
                        correo: { type: 'string', format: 'email' },
                        activo: { type: 'boolean', default: true },
                        metadatos: { type: 'object' }
                    }
                }
            }
        },
    },
    apis: ['./src/routes/*.ts', './src/index.ts'], 
};
const openapiSpecification = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));


// --- ROUTE DEFINITIONS ---

// Public routes
app.use('/auth', createAuthRouter(authController));

// Root & Health Check
app.get('/', (req, res) => handleSuccess(res, { message: 'Welcome to the Hexagonal API!' }));
app.get('/health', (req, res) => handleSuccess(res, { status: 'ok' }));

// Protected API routes
const apiRouter = express.Router();
apiRouter.use(authMiddleware); // All routes under /api/* are now protected

// Connect routers
apiRouter.use('/content', contentRouter);
apiRouter.use('/entes', createEnteRouter(enteController)); // Add the new router

// DB Test Route
apiRouter.get('/test-db', asyncHandler(async (req, res) => {
    await db.collection('test').doc('health-check').set({ status: 'ok', timestamp: new Date() });
    handleSuccess(res, { message: 'Successfully connected to and wrote to Firestore!' });
}));

app.use('/api', apiRouter);


// --- ERROR HANDLING MIDDLEWARE ---
// Custom logger for errors, passed to the errorHandler
app.use((err: any, req: any, res: any, next: any) => {
    Logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    next(err);
});
app.use(notFoundHandler);
app.use(errorHandler);


// --- SERVER STARTUP ---
const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
    Logger.info(`Server running on http://localhost:${port}`); // Use Logger
    Logger.info(`API Docs available at http://localhost:${port}/api-docs`); // Use Logger
});

/**
 * @swagger
 * tags:
 *   - name: Public
 *     description: Endpoints accessible without authentication.
 *   - name: Auth
 *     description: Endpoints for user authentication.
 *   - name: Entes
 *     description: Operations about entes (clients, organizations, etc.). Requires authentication.
 *   - name: Content
 *     description: Endpoints for content generation (requires authentication).
 * components:
 *   schemas:
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean, example: true }
 *         data: { type: object }
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean, example: false }
 *         status: { type: integer, example: 400 }
 *         error:
 *           type: object
 *           properties:
 *             key: { type: string, example: "VALIDATION_ERROR" }
 *             message: { type: string, example: "Invalid input." }
 */
