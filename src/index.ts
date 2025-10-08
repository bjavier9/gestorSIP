import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import { initializeFirebase } from './config/firebase';
import { container, configureContainer } from './di/container';
import { errorHandler } from './middleware/errorHandler';

// Import route creation functions
import { createAuthRoutes } from './routes/auth';
import { createCompaniaCorretajeRoutes } from './routes/companiaCorretaje';
import { createOficinaRoutes } from './routes/oficinas';
import { createUsuariosCompaniasRoutes } from './routes/usuariosCompanias';
import { createEntesRoutes } from './routes/entes';
import { createConfigurationRoutes } from './routes/configurations';
import { createAseguradorasRoutes } from './routes/aseguradoras';
import { createLeadRoutes } from './routes/leads';
import { createGestionesRoutes } from './routes/gestiones';
import { createPolizasRoutes } from './routes/polizas';
import { createIssueRoutes } from './routes/issues'
// src/index.ts


dotenv.config();

async function startServer() {
  try {
    // 1. Inicializar Firebase
    await initializeFirebase();
    console.log('Firebase has been initialized.');

    // 2. Configurar el contenedor de inyección de dependencias
    configureContainer();
    console.log('Dependency injection container configured.');

    const app = express();
    const port = process.env.PORT || 3000;

    app.use(express.json());

    // 3. Crear y usar las rutas, pasando el contenedor
    app.use('/api/auth', createAuthRoutes(container));
    app.use('/api/companias', createCompaniaCorretajeRoutes(container));
    app.use('/api/companias/:companiaId/oficinas', createOficinaRoutes(container));
    app.use('/api/usuarios-companias', createUsuariosCompaniasRoutes(container));
    app.use('/api/entes', createEntesRoutes(container));
    app.use('/api/configurations', createConfigurationRoutes(container));
    app.use('/api/aseguradoras', createAseguradorasRoutes(container));
    app.use('/api/leads', createLeadRoutes(container));
    app.use('/api/gestiones', createGestionesRoutes(container));
    app.use('/api/polizas', createPolizasRoutes(container));
    // ruta nueva de issue
    app.use('/api/issue', createIssueRoutes(container));

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
