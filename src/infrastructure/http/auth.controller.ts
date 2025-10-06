
// src/infrastructure/http/auth.controller.ts

import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { AuthService } from '../../application/auth.service';
import { handleSuccess } from '../../utils/responseHandler';
import { TYPES } from '../../config/types';
import { ApiError } from '../../utils/ApiError';

@injectable()
export class AuthController {
  constructor(@inject(TYPES.AuthService) private readonly authService: AuthService) {}

  async login(req: Request, res: Response) {
    const { idToken } = req.body;

    if (!idToken) {
      throw new ApiError('AUTH_MISSING_ID_TOKEN', 'Firebase ID token is required.', 400);
    }

    const result = await this.authService.login(idToken);
    handleSuccess(req, res, result, 200, { token: result.token });
  }

  async register(req: Request, res: Response) {
    const { idToken } = req.body;

    if (!idToken) {
        throw new ApiError('AUTH_MISSING_ID_TOKEN', 'Firebase ID token is required for registration.', 400);
    }

    // Suponiendo que el servicio de autenticación tendrá un método de registro
    // Esto necesitará ser implementado en AuthService
    const result = await this.authService.register(idToken);
    handleSuccess(req, res, result, 201); // 201 Created para un nuevo recurso
  }

  async loginSuperAdmin(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError('AUTH_MISSING_CREDENTIALS', 'Email and password are required.', 400);
    }

    const result = await this.authService.loginSuperAdmin(email, password);
    handleSuccess(req, res, result, 200, { token: result.token });
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
