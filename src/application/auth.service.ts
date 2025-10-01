
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

  private signToken(payload: AuthPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions);
  }

  public async loginSuperAdmin(email: string, password: string): Promise<{ token: string }> {
    const superAdminEmail = process.env.SUPERADMIN_EMAIL;
    const superAdminPassword = process.env.SUPERADMIN_PASSWORD;

    if (!superAdminEmail || !superAdminPassword) {
      throw new ApiError('SUPERADMIN_NOT_CONFIGURED', 500, 'Super admin credentials are not configured.');
    }

    if (email !== superAdminEmail || password !== superAdminPassword) {
      throw new ApiError('AUTH_INVALID_CREDENTIALS', 401, 'Invalid credentials for super admin.');
    }

    const payload: AuthPayload = {
      uid: 'super_admin',
      email: superAdminEmail,
      role: 'superadmin',
    };

    const token = this.signToken(payload);
    return { token };
  }

  public async login(idToken: string): Promise<LoginResponse> {
    let decodedToken: DecodedIdToken;
    try {
      decodedToken = await getAuth().verifyIdToken(idToken);
    } catch (error) {
      throw new ApiError('AUTH_INVALID_FIREBASE_TOKEN', 401, 'Invalid Firebase token.', error);
    }

    const { uid, email } = decodedToken;
    const userCompanias = await this.usuarioCompaniaRepo.findByUserId(uid);

    if (userCompanias.length === 0) {
      throw new ApiError('AUTH_NO_COMPANIES_ASSIGNED', 403, 'User is not assigned to any company.');
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
      const token = this.signToken(payload);
      // Always return the list of companies
      return { token, companias: userCompanias, needsSelection: false };
    }

    // If multiple companies and not a supervisor, require selection
    const payload: AuthPayload = { uid, email: email!, pendienteCia: true };
    const token = this.signToken(payload);

    return {
      token,
      companias: userCompanias,
      needsSelection: true,
    };
  }

  public async selectCompania(currentUser: AuthPayload, selectedCompaniaId: string): Promise<{ token: string }> {
    if (!currentUser.pendienteCia) {
      throw new ApiError('AUTH_COMPANY_ALREADY_SELECTED', 400, 'Company has already been selected.');
    }

    const userCompania = await this.usuarioCompaniaRepo.findByUserAndCompania(
      currentUser.uid,
      selectedCompaniaId
    );

    if (!userCompania) {
      throw new ApiError('AUTH_INVALID_COMPANY_SELECTION', 403, 'User does not belong to the selected company.');
    }

    const newPayload: AuthPayload = {
      uid: currentUser.uid,
      email: currentUser.email,
      role: userCompania.rol,
      companiaCorretajeId: userCompania.companiaCorretajeId,
      oficinaId: userCompania.oficinaId,
      enteId: userCompania.enteId,
    };

    const token = this.signToken(newPayload);
    return { token };
  }

  public async getTestToken(secret: string): Promise<{ token: string }> {
    const isTestEnv = ['development', 'test'].includes(process.env.NODE_ENV || 'development');
    const testSecret = process.env.TEST_SECRET;

    if (!isTestEnv) {
      throw new ApiError('AUTH_ENDPOINT_NOT_AVAILABLE', 404, 'This endpoint is not available in this environment.');
    }

    if (!testSecret || secret !== testSecret) {
      throw new ApiError('AUTH_INVALID_SECRET', 401, 'Invalid secret for test token.');
    }

    // In a real scenario, you would fetch or define a specific test user
    const adminUser = {
        uid: 'admin_user_uid',
        email: 'admin@seguroplus.com',
        rol: 'admin' as 'admin',
        companiaCorretajeId: 'comp_001',
        oficinaId: 'oficina_001',
        enteId: 6200,
    };
    
    const payload: AuthPayload = {
      uid: adminUser.uid,
      email: adminUser.email,
      role: adminUser.rol,
      companiaCorretajeId: adminUser.companiaCorretajeId,
      oficinaId: adminUser.oficinaId,
      enteId: adminUser.enteId,
    };

    const token = this.signToken(payload);
    return { token };
  }
}
