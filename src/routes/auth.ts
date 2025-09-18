import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthController } from '../infrastructure/http/auth.controller';

export const createAuthRouter = (controller: AuthController): Router => {
    const router = Router();

    /**
     * @swagger
     * /auth/register:
     *   post:
     *     tags: [Auth]
     *     summary: Register a new user and associated ente
     *     description: Creates a new user, a corresponding 'ente', and links them to a brokerage company.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *               - nombre
     *               - companiaCorretajeId
     *             properties:
     *               email: { type: string, format: email, description: 'User email and login username.' }
     *               password: { type: string, format: password, description: 'User password (will be hashed).' }
     *               nombre: { type: string, description: 'Full name of the person (ente).' }
     *               telefono: { type: string, description: 'Contact phone for the ente.' }
     *               companiaCorretajeId: { type: string, description: 'The ID of the brokerage company the user is joining.' }
     *     responses:
     *       200:
     *         description: User and ente created successfully.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SuccessResponse'
     *       400:
     *         description: Invalid input or email already in use.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    router.post('/register', asyncHandler((req, res) => controller.register(req, res)));

    /**
     * @swagger
     * /auth/login:
     *   post:
     *     tags: [Auth]
     *     summary: Login a user
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [email, password]
     *             properties:
     *               email: { type: string, format: email }
     *               password: { type: string, format: password }
     *     responses:
     *       200:
     *         description: Login successful, returns user and JWT token.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SuccessResponse'
     *       401:
     *         description: Invalid credentials.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    router.post('/login', asyncHandler((req, res) => controller.login(req, res)));

    return router;
};
