import { Router } from 'express';
import { Container } from 'inversify';
import { AuthController } from '../infrastructure/http/auth.controller';
import { TYPES } from '../di/types';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware } from '../middleware/authMiddleware';

// Crea y devuelve el router configurado con el contenedor
export const createAuthRoutes = (container: Container): Router => {
    const router = Router();
    const authController = container.get<AuthController>(TYPES.AuthController);

    router.post('/login', asyncHandler(authController.login.bind(authController)));
    router.post('/register', authMiddleware, asyncHandler(authController.register.bind(authController)));

    return router;
};


