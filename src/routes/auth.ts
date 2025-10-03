import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthController } from '../infrastructure/http/auth.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import container from '../config/container';
import { TYPES } from '../config/types';

const authController = container.get<AuthController>(TYPES.AuthController);

const router = Router();

/**
 * @swagger
 * /api/auth/login/superadmin:
 *   post:
 *     tags: [Auth]
 *     summary: Login for Super Admin
 *     description: Authenticates the Super Admin using environment credentials.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: 'string' }
 *               password: { type: 'string' }
 *     responses:
 *       200:
 *         description: Super Admin authentication successful.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     body:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: object
 *                           properties:
 *                             token: { type: 'string' }
 *       401:
 *         description: Invalid credentials.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Super Admin is not configured.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login/superadmin', asyncHandler(authController.loginSuperAdmin.bind(authController)));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with Firebase ID Token
 *     description: Verifies a Firebase ID token and returns a JWT for the application.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Authentication successful. The response may require the user to select a company.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     body:
 *                       type: object
 *                       properties:
 *                         data:
 *                           $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid or expired Firebase token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: User is not assigned to any company.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', asyncHandler(authController.login.bind(authController)));

/**
 * @swagger
 * /api/auth/select-compania:
 *   post:
 *     tags: [Auth]
 *     summary: Select a Company to Finalize Login
 *     description: |
 *       If login returns `needsSelection: true`, use this endpoint to select a company and get a final JWT.
eedsSelection: true, use this endpoint to select a company and get a final JWT.
eedsSelection: true, use this endpoint to select a company and get a final JWT.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SelectCompaniaRequest'
 *     responses:
 *       200:
 *         description: Company selected. Returns the final JWT.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     body:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: object
 *                           properties:
 *                             token: { type: 'string' }
 *       400:
 *         description: companyId is missing or has already been selected.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid or missing token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: User does not belong to the selected company.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/select-compania',
  authMiddleware,
  asyncHandler(authController.selectCompania.bind(authController))
);

/**
 * @swagger
 * /api/auth/info:
 *   get:
 *     tags: [Auth]
 *     summary: Get Current User Info
 *     description: Returns information about the currently authenticated user based on the JWT.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     body:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: object
 *                           properties:
 *                             projectId: { type: 'string' }
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/info', authMiddleware, asyncHandler(authController.getAuthInfo.bind(authController)));

/**
 * @swagger
 * /api/auth/test-token:
 *   post:
 *     tags: [Auth]
 *     summary: Get a Test JWT for a Regular User
 *     description: (DEV/TEST ONLY) Returns a JWT for a regular user without Firebase authentication.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               secret: { type: 'string' }
 *     responses:
 *       200:
 *         description: Test token generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     body:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: object
 *                           properties:
 *                             token: { type: 'string' }
 *       401:
 *         description: Invalid secret.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Endpoint not available in this environment.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/test-token', asyncHandler(authController.getTestToken.bind(authController)));

export default router;



