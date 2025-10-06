import { Router } from 'express';
import { Container } from 'inversify';
import { UsuarioCompaniaController } from '../infrastructure/http/usuarioCompania.controller';
import { TYPES } from '../config/types';
import { asyncHandler } from '../middleware/asyncHandler';

export const createUsuariosCompaniasRoutes = (container: Container): Router => {
    const router = Router();
    const controller = container.get<UsuarioCompaniaController>(TYPES.UsuarioCompaniaController);

    router.post('/', asyncHandler(controller.create.bind(controller)));
    router.get('/:id', asyncHandler(controller.getById.bind(controller)));

    return router;
};
