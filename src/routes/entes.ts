import { Router } from 'express';
import { EnteController } from '../infrastructure/http/ente.controller';
import asyncHandler from 'express-async-handler';

// This router is now fully managed by the factory function.
export const createEnteRouter = (enteController: EnteController): Router => {
    const router = Router();

    // Define routes and attach controller methods using asyncHandler for error handling
    router.post('/', asyncHandler(enteController.create));
    router.get('/', asyncHandler(enteController.getAll));
    router.get('/:id', asyncHandler(enteController.getById));
    router.patch('/:id', asyncHandler(enteController.update));
    router.delete('/:id', asyncHandler(enteController.delete));

    return router;
};
