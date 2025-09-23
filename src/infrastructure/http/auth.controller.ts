
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
      throw new ApiError('AUTH_MISSING_ID_TOKEN', 400, 'Firebase ID token is required.');
    }

    const result = await this.authService.login(idToken);
    handleSuccess(res, result);
  }

  async selectCompania(req: Request, res: Response) {
    // The currentUser payload is attached by the authentication middleware
    const currentUser = (req as any).user; 
    const { companiaId } = req.body;

    if (!currentUser) {
      throw new ApiError('AUTH_INVALID_TOKEN', 401, 'Invalid or missing authentication token.');
    }

    if (!companiaId) {
      throw new ApiError('VALIDATION_MISSING_FIELD', 400, 'companiaId is required.');
    }

    const result = await this.authService.selectCompania(currentUser, companiaId);
    handleSuccess(res, result);
  }

  async getAuthInfo(req: Request, res: Response) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new ApiError('CONFIG_ERROR', 500, 'FIREBASE_PROJECT_ID is not configured on the server.');
    }
    handleSuccess(res, { projectId });
  }

  async getTestToken(req: Request, res: Response) {
    const { secret } = req.body;

    if (!secret) {
      throw new ApiError('AUTH_MISSING_SECRET', 400, 'Secret is required for test token.');
    }

    const result = await this.authService.getTestToken(secret);
    handleSuccess(res, result);
  }
}
