
import 'express-async-handler';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import morgan from 'morgan';
import Logger from './config/logger';
import { db } from './config/firebase';

// --- DEPENDENCY INJECTION ---
// Importa los controladores ya construidos desde el contenedor de dependencias.
import { authController, enteController } from './config/container';

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

// --- SWAGGER DOCUMENTATION (Opciones de Swagger) ---
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
            // ... (resto de los esquemas de Swagger)
        },
    },
    apis: ['./src/routes/*.ts', './src/index.ts'], 
};
const openapiSpecification = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));


// --- ROUTE DEFINITIONS ---
// Las rutas ahora usan los controladores importados desde el contenedor.
app.use('/auth', createAuthRouter(authController));
app.get('/', (req, res) => handleSuccess(res, { message: 'Welcome to the Hexagonal API!' }));
app.get('/health', (req, res) => handleSuccess(res, { status: 'ok' }));

const apiRouter = express.Router();
apiRouter.use(authMiddleware);

// Rutas protegidas
apiRouter.use('/content', contentRouter);
apiRouter.use('/entes', createEnteRouter(enteController));

apiRouter.get('/test-db', asyncHandler(async (req, res) => {
    await db.collection('test').doc('health-check').set({ status: 'ok', timestamp: new Date() });
    handleSuccess(res, { message: 'Successfully connected to and wrote to Firestore!' });
}));

app.use('/api', apiRouter);


// --- ERROR HANDLING MIDDLEWARE ---
app.use((err: any, req: any, res: any, next: any) => {
    Logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    next(err);
});
app.use(notFoundHandler);
app.use(errorHandler);


// --- SERVER STARTUP ---
const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
    Logger.info(`Server running on http://localhost:${port}`);
    Logger.info(`API Docs available at http://localhost:${port}/api-docs`);
});

/**
 * @swagger
 * tags:
 *   - name: Public
 *     description: Endpoints accesibles sin autenticación.
 *   - name: Auth
 *     description: Endpoints para autenticación de usuarios.
 *   - name: Entes
 *     description: Operaciones sobre entes (clientes, etc.). Requiere autenticación.
 *   - name: Content
 *     description: Endpoints para generación de contenido. Requiere autenticación.
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
