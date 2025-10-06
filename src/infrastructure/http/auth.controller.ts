
// src/infrastructure/http/auth.controller.ts

import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { AuthService, RegisterUserInput } from '../../application/auth.service';
import { handleSuccess } from '../../utils/responseHandler';
import { TYPES } from '../../config/types';
import { ApiError } from '../../utils/ApiError';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticacion y gestion de sesiones.
 */
@injectable()
export class AuthController {
  constructor(@inject(TYPES.AuthService) private readonly authService: AuthService) {}

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     tags: [Auth]
   *     summary: Inicia sesion con Firebase o credenciales de super admin.
   *     description: Envia un idToken de Firebase o las credenciales definidas en las variables de entorno para el super admin.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *           examples:
   *             firebase:
   *               summary: Inicio de sesion con Firebase
   *               value:
   *                 idToken: 'firebase-id-token'
   *             superadmin:
   *               summary: Inicio de sesion como super admin
   *               value:
   *                 email: 'superadmin@example.com'
   *                 password: 'super-secret'
   *     responses:
   *       200:
   *         description: Token JWT emitido correctamente.
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
   *                         message:
   *                           type: string
   *       400:
   *         description: Solicitud invalida.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       401:
   *         description: Credenciales invalidas.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async login(req: Request, res: Response) {
    const { idToken, email, password } = req.body || {};

    if (email || password) {
      if (!email || !password) {
        throw new ApiError('AUTH_MISSING_CREDENTIALS', 'Email and password are required for super admin login.', 400);
      }

      const result = await this.authService.loginSuperAdmin(email, password);
      handleSuccess(req, res, result, 200, { token: result.token });
      return;
    }

    if (!idToken) {
      throw new ApiError('AUTH_MISSING_ID_TOKEN', 'Firebase ID token is required unless super admin credentials are provided.', 400);
    }

    const result = await this.authService.login(idToken);
    handleSuccess(req, res, result, 200, { token: result.token });
  }

  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     tags: [Auth]
   *     summary: Registra un usuario dentro de la compania actual.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [enteId, rol]
   *             properties:
   *               enteId:
   *                 type: string
   *                 description: Identificador del ente a asociar.
   *               rol:
   *                 type: string
   *                 description: Rol que tendra el usuario dentro de la compania.
   *               companiaCorretajeId:
   *                 type: string
   *                 description: Requerido solo para super admin.
   *               oficinaId:
   *                 type: string
   *                 nullable: true
   *     responses:
   *       201:
   *         description: Usuario registrado correctamente.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *       400:
   *         description: Datos faltantes.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       401:
   *         description: Token invalido.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async register(req: AuthenticatedRequest, res: Response) {
    const currentUser = req.user?.user;
    if (!currentUser) {
      throw new ApiError('AUTH_INVALID_TOKEN', 'Invalid or missing authentication token.', 401);
    }

    const { enteId, rol, companiaCorretajeId, oficinaId } = req.body || {};
    if (!enteId) {
      throw new ApiError('VALIDATION_MISSING_FIELD', 'enteId es requerido para registrar un usuario.', 400);
    }
    if (!rol) {
      throw new ApiError('VALIDATION_MISSING_FIELD', 'rol es requerido para registrar un usuario.', 400);
    }

    const payload: RegisterUserInput = {
      enteId: String(enteId),
      rol: String(rol).toLowerCase(),
      ...(companiaCorretajeId ? { companiaCorretajeId: String(companiaCorretajeId) } : {}),
      ...(oficinaId ? { oficinaId: String(oficinaId) } : {}),
    };

    const result = await this.authService.register(currentUser, payload);
    handleSuccess(req, res, result, 201);
  }

  async selectCompania(req: Request, res: Response) {
    const currentUser = (req as any).user; 
    const { companiaId } = req.body;

    if (!currentUser) {
      throw new ApiError('AUTH_INVALID_TOKEN', 'Invalid or missing authentication token.', 401);
    }

    if (!companiaId) {
      throw new ApiError('VALIDATION_MISSING_FIELD', 'companiaId is required.', 400);
    }

    const result = await this.authService.selectCompania(currentUser, companiaId);
    handleSuccess(req, res, result, 200, { token: result.token });
  }

  async getAuthInfo(req: Request, res: Response) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new ApiError('CONFIG_ERROR', 'FIREBASE_PROJECT_ID is not configured on the server.', 500);
    }
    handleSuccess(req, res, { projectId });
  }

  async getTestToken(req: Request, res: Response) {
    const { secret } = req.body;

    if (!secret) {
      throw new ApiError('AUTH_MISSING_SECRET', 'Secret is required for test token.', 400);
    }

    const result = await this.authService.getTestToken(secret);
    handleSuccess(req, res, result, 200, { token: result.token });
  }
}

