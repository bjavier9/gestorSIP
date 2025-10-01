
// src/application/auth.service.ts

import { inject, injectable } from 'inversify';
import { getAuth } from 'firebase-admin/auth';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UsuarioCompaniaRepository } from '../domain/ports/usuarioCompaniaRepository.port';
import { TYPES } from '../config/types';
import { ApiError } from '../utils/ApiError';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { UsuarioCompania } from '../domain/usuarioCompania';

const JWT_SECRET: string = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

if (!JWT_SECRET) {
  throw new Error('FATAL_ERROR: JWT_SECRET environment variable is not set.');
}

// The final JWT payload structure
export interface AuthPayload {
  uid: string; // Firebase UID
  email: string;
  role?: 'superadmin' | 'admin' | 'supervisor' | 'agent' | 'viewer';
  companiaCorretajeId?: string; 
  oficinaId?: string;
  enteId?: number; 
  pendienteCia?: boolean; // Flag to indicate company selection is pending
}

export interface LoginResponse {
  token: string;
  companias: UsuarioCompania[]; // Always return the list of companies
  needsSelection: boolean; // True if user needs to select a company
}

@injectable()
export class AuthService {
  constructor(
    @inject(TYPES.UsuarioCompaniaRepository) private usuarioCompaniaRepo: UsuarioCompaniaRepository
  ) {}

  private signToken(payload: object): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions);
  }

  public async loginSuperAdmin(email: string, password: string): Promise<{ token: string }> {
    const superAdminEmail = process.env.SUPERADMIN_EMAIL;
    const superAdminPassword = process.env.SUPERADMIN_PASSWORD;

    if (!superAdminEmail || !superAdminPassword) {
      throw new ApiError('SUPERADMIN_NOT_CONFIGURED', 'Super admin credentials are not configured.', 500);
    }

    if (email !== superAdminEmail || password !== superAdminPassword) {
      throw new ApiError('AUTH_INVALID_CREDENTIALS', 'Invalid credentials for super admin.', 401);
    }

    const payload = {
      user: {
        uid: 'super_admin',
        email: superAdminEmail,
        role: 'superAdmin',
      }
    };

    const token = this.signToken(payload);
    return { token };
  }

  public async login(idToken: string): Promise<LoginResponse> {
    let decodedToken: DecodedIdToken;
    try {
      decodedToken = await getAuth().verifyIdToken(idToken);
    } catch (error) {
      throw new ApiError('AUTH_INVALID_FIREBASE_TOKEN', 'Invalid Firebase token.', 401);
    }

    const { uid, email } = decodedToken;
    const userCompanias = await this.usuarioCompaniaRepo.findByUserId(uid);

    if (userCompanias.length === 0) {
      throw new ApiError('AUTH_NO_COMPANIES_ASSIGNED', 'User is not assigned to any company.', 403);
    }

    // Auto-select if user is supervisor or has only one company
    const isSupervisor = userCompanias.some(uc => uc.rol === 'supervisor');
    if (isSupervisor || userCompanias.length === 1) {
      const primaryRelation = userCompanias[0];
      const payload: AuthPayload = {
        uid,
        email: email!,
        role: primaryRelation.rol,
        companiaCorretajeId: primaryRelation.companiaCorretajeId,
        oficinaId: primaryRelation.oficinaId,
        enteId: primaryRelation.enteId,
      };
      const token = this.signToken({ user: payload });
      // Always return the list of companies
      return { token, companias: userCompanias, needsSelection: false };
    }

    // If multiple companies and not a supervisor, require selection
    const payload = { user: { uid, email: email!, pendienteCia: true } };
    const token = this.signToken(payload);

    return {
      token,
      companias: userCompanias,
      needsSelection: true,
    };
  }

  public async selectCompania(currentUser: any, selectedCompaniaId: string): Promise<{ token: string }> {
    if (!currentUser.user.pendienteCia) {
      throw new ApiError('AUTH_COMPANY_ALREADY_SELECTED', 'Company has already been selected.', 400);
    }

    const userCompania = await this.usuarioCompaniaRepo.findByUserAndCompania(
      currentUser.user.uid,
      selectedCompaniaId
    );

    if (!userCompania) {
      throw new ApiError('AUTH_INVALID_COMPANY_SELECTION', 'User does not belong to the selected company.', 403);
    }

    const newPayload: AuthPayload = {
      uid: currentUser.user.uid,
      email: currentUser.user.email,
      role: userCompania.rol,
      companiaCorretajeId: userCompania.companiaCorretajeId,
      oficinaId: userCompania.oficinaId,
      enteId: userCompania.enteId,
    };

    const token = this.signToken({ user: newPayload });
    return { token };
  }

  public async getTestToken(secret: string): Promise<{ token: string }> {
    const isTestEnv = ['development', 'test'].includes(process.env.NODE_ENV || 'development');
    const testSecret = process.env.TEST_SECRET;

    if (!isTestEnv) {
      throw new ApiError('AUTH_ENDPOINT_NOT_AVAILABLE', 'This endpoint is not available in this environment.', 404);
    }

    if (!testSecret || secret !== testSecret) {
      throw new ApiError('AUTH_INVALID_SECRET', 'Invalid secret for test token.', 401);
    }

    const payload = {
        user: {
            uid: 'test_user_uid',
            email: 'test@example.com',
            role: 'user',
        }
    };

    const token = this.signToken(payload);
    return { token };
  }
}
