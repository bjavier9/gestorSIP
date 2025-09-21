
// src/routes/auth.ts

import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthController } from '../infrastructure/http/auth.controller';
import { authMiddleware } from '../middleware/authMiddleware'; // Assuming you have this middleware

export const createAuthRouter = (controller: AuthController): Router => {
  const router = Router();

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     tags: [Auth]
   *     summary: Login with Firebase ID Token
   *     description: Verifies a Firebase ID token and returns a JWT for the application. The response may require the user to select a company if they belong to multiple.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [idToken]
   *             properties:
   *               idToken: { type: string, description: 'The Firebase ID token obtained from the client-side authentication.' }
   *     responses:
   *       200:
   *         description: Authentication successful. Returns a JWT and, if needed, a list of companies for selection.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoginResponse'
   *       401:
   *         description: Invalid or expired Firebase token.
   *       403:
   *         description: User is not assigned to any company.
   */
  router.post('/login', asyncHandler((req, res) => controller.login(req, res)));

  /**
   * @swagger
   * /auth/select-compania:
   *   post:
   *     tags: [Auth]
   *     summary: Select a Company to Finalize Login
   *     description: After a successful initial login, if the user belongs to multiple companies, this endpoint is used to select one and receive a new JWT with the correct role and company scope.
   *     security: 
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [companiaId]
   *             properties:
   *               companiaId: { type: string, description: 'The ID of the company the user is selecting.' }
   *     responses:
   *       200:
   *         description: Company selected successfully. Returns the final JWT.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token: { type: string }
   *       400:
   *         description: companyId is missing or company has already been selected.
   *       401:
   *         description: 'Invalid or missing token (must have `pendienteCia: true`).'
   *       403:
   *         description: User does not belong to the selected company.
   */
  router.post(
    '/select-compania',
    authMiddleware, // Protect this route
    asyncHandler((req, res) => controller.selectCompania(req, res))
  );

  return router;
};
