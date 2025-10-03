import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import morgan from 'morgan';
import Logger from './config/logger';
import { initializeFirebase } from './config/firebase';

async function startServer() {
    // --- 1. INITIALIZE EXTERNAL SERVICES ---
    // Must be done BEFORE any other app module is imported
    initializeFirebase();
    Logger.info('Firebase has been initialized.');

    // --- 2. DYNAMICALLY IMPORT MODULES THAT DEPEND ON INITIALIZED SERVICES ---
    // This prevents race conditions where modules try to access services (e.g., DB) before they are ready.
    const { default: swaggerSpec } = await import('./config/swagger');
    const { default: authRouter } = await import('./routes/auth');
    const { default: enteRouter } = await import('./routes/entes');
    // Content API removed per requirements
    const { default: companiaCorretajeRouter } = await import('./routes/companiaCorretaje');
    const { errorHandler, notFoundHandler } = await import('./middleware/errorHandler');
    const { handleSuccess } = await import('./utils/responseHandler');

    // --- 3. CREATE AND CONFIGURE EXPRESS APP ---
    const app = express();

    // Core Middleware
    app.use(express.json());

    // HTTP Logging
    const stream = { write: (message: string) => Logger.http(message.trim()) };
    app.use(morgan('combined', { stream }));

    // API Documentation
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // API Routes
    app.use('/api/auth', authRouter);
    app.use('/api/entes', enteRouter);
    const { default: usuariosCompaniasRouter } = await import('./routes/usuariosCompanias');
    app.use('/api/usuarios-companias', usuariosCompaniasRouter);
    app.use('/api/companias', companiaCorretajeRouter);

    // Public Routes
    app.get('/', (req, res) => handleSuccess(res, { message: 'Welcome to the gestorSIP API!' }));
    app.get('/health', (req, res) => handleSuccess(res, { status: 'ok' }));

    // Error Handling (must be last)
    app.use(notFoundHandler);
    app.use(errorHandler);

    // --- 4. START THE HTTP SERVER ---
    const port = parseInt(process.env.PORT || '3000');
    app.listen(port, () => {
        Logger.info(`Server running on http://localhost:${port}`);
        Logger.info(`API Docs available at http://localhost:${port}/api-docs`);
    });
}

startServer().catch(error => {
    // Use a logger that will definitely work, like console.error
    console.error("Failed to start server:", error);
    // Log with the application logger if it's available
    if (Logger) {
        Logger.error("Failed to start server:", { error: error.stack });
    }
    process.exit(1);
});
