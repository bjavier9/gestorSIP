
import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import { initializeFirebase } from './config/firebase';
import { errorHandler } from './middleware/errorHandler';

// Importar rutas
import authRoutes from './routes/auth';
import contentRoutes from './routes/content';
import companiaCorretajeRoutes from './routes/companiaCorretaje';
import oficinaRoutes from './routes/oficinas';
import usuariosCompaniasRoutes from './routes/usuariosCompanias';
import entesRoutes from './routes/entes';
import configurationRoutes from './routes/configurations';
import aseguradorasRoutes from './routes/aseguradoras'; // <-- Nueva ruta

dotenv.config();

async function startServer() {
    try {
        await initializeFirebase();
        console.log('Firebase has been initialized.');

        const app = express();
        const port = process.env.PORT || 3000;

        app.use(express.json());

        // Rutas de la API
        app.use('/api/auth', authRoutes);
        app.use('/api', contentRoutes);
        app.use('/api/companias', companiaCorretajeRoutes);
        app.use('/api/companias/:companiaId/oficinas', oficinaRoutes);
        app.use('/api/usuarios-companias', usuariosCompaniasRoutes);
        app.use('/api/entes', entesRoutes);
        app.use('/api/configurations', configurationRoutes);
        app.use('/api/aseguradoras', aseguradorasRoutes); // <-- Nueva ruta

        // Ruta de Swagger
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

        // Manejador de errores global
        app.use(errorHandler);

        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
            console.log(`Swagger docs available on http://localhost:${port}/api-docs`);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
