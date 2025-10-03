
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import container from '../config/container';
import { TYPES } from '../config/types';
import { LeadController } from '../infrastructure/http/lead.controller';
import { agentSupervisorMiddleware, authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Lazy-load the controller inside the route handler to prevent circular dependency issues at startup.
const getController = () => container.get<LeadController>(TYPES.LeadController);

// Any authenticated user of the company can read
router.get('/', authMiddleware, asyncHandler((req, res, next) => {
    getController().getAll(req, res, next);
}));

router.get('/:id', authMiddleware, asyncHandler((req, res, next) => {
    getController().getById(req, res, next);
}));

// Only agents and supervisors can create, update, and delete
router.post('/', authMiddleware, agentSupervisorMiddleware, asyncHandler((req, res, next) => {
    getController().create(req, res, next);
}));

router.put('/:id', authMiddleware, agentSupervisorMiddleware, asyncHandler((req, res, next) => {
    getController().update(req, res, next);
}));

router.delete('/:id', authMiddleware, agentSupervisorMiddleware, asyncHandler((req, res, next) => {
    getController().delete(req, res, next);
}));

export default router;
