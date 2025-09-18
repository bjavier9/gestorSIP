
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/loggerMiddleware'; // Assuming you have this middleware
import { initializeFirebase, db } from './config/firebase';

// Import Routers
import { createAuthRouter } from './routes/auth';
import { createEnteRouter } from './routes/entes';
import contentRoutes from './routes/content';

// Import Controllers
import { AuthController } from './infrastructure/http/auth.controller';
import { EnteController } from './infrastructure/http/ente.controller';

// Import Services
import { AuthService } from './application/auth.service';
import { EnteService } from './application/ente.service';

// Import Repositories (Adapters)
import { FirebaseUserRepository } from './infrastructure/persistence/firebaseUserRepository.adapter';
import { FirebaseEnteRepository } from './infrastructure/persistence/firebaseEnteRepository.adapter';
import { FirebaseEnteCompaniaRepository } from './infrastructure/persistence/firebaseEnteCompania.adapter';

// Initialize Firebase
initializeFirebase();

const app = express();

// --- Middleware ---
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(requestLogger); // Make sure you have this middleware file created

// --- API Documentation ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Dependency Injection Setup ---

// 1. Repositories (Data Access Layer)
const userRepository = new FirebaseUserRepository();
const enteRepository = new FirebaseEnteRepository();
const enteCompaniaRepository = new FirebaseEnteCompaniaRepository(db); // Assuming it needs the db instance

// 2. Services (Application/Business Logic Layer)
const authService = new AuthService(userRepository, enteRepository, enteCompaniaRepository);
const enteService = new EnteService(enteRepository);

// 3. Controllers (Presentation Layer)
const authController = new AuthController(authService);
const enteController = new EnteController(enteService);

// 4. Routers (Routing Layer)
const authRouter = createAuthRouter(authController);
const enteRouter = createEnteRouter(enteController);

// --- Route Definitions ---
app.use('/api/auth', authRouter);
app.use('/api/entes', enteRouter);
app.use('/api/content', contentRoutes); // This one doesn't seem to need DI

// --- Centralized Error Handling ---
app.use(errorHandler);

export default app;
