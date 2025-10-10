
import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { LoginService } from '../../application/auth/login.service';
import { RegisterService } from '../../application/auth/register.service';
import { SessionService } from '../../application/auth/session.service';
import { RegisterUserInput } from '../../domain/entities/auth';
import { handleSuccess } from '../../utils/responseHandler';
import { TYPES } from '../../di/types';
import { ApiError } from '../../utils/ApiError';
import { AuthenticatedRequest } from '../../middleware/authentication.middleware';

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.LoginService) private readonly loginService: LoginService,
    @inject(TYPES.RegisterService) private readonly registerService: RegisterService,
    @inject(TYPES.SessionService) private readonly sessionService: SessionService
  ) {}

  async login(req: Request, res: Response) {
    const { idToken } = req.body;

    if (!idToken) {
      throw new ApiError('AUTH_MISSING_ID_TOKEN', 'Firebase ID token is required.', 400);
    }

    const result = await this.loginService.login(idToken);
    handleSuccess(req, res, result, 200, { token: result.token });
  }

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

    const result = await this.registerService.register(currentUser, payload);
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

    const result = await this.sessionService.selectCompania(currentUser, companiaId);
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

    const result = await this.sessionService.getTestToken(secret);
    handleSuccess(req, res, result, 200, { token: result.token });
  }
}
