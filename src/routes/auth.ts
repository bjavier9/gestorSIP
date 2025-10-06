import { Router } from 'express';
import { Container } from 'inversify';
import { AuthController } from '../infrastructure/http/auth.controller';
import { TYPES } from '../config/types';
import { asyncHandler } from '../middleware/asyncHandler';

// La función ahora crea y devuelve el router, dependiendo del contenedor
export const createAuthRoutes = (container: Container): Router => {
    const router = Router();
    // El controlador se obtiene del contenedor que se pasa como argumento
    const authController = container.get<AuthController>(TYPES.AuthController);

    router.post('/login', asyncHandler(authController.login.bind(authController)));
    router.post('/register', asyncHandler(authController.register.bind(authController)));

    return router;
};
