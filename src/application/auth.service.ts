
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
  rol?: 'admin' | 'supervisor' | 'agent' | 'viewer';
  companiaCorretajeId?: string; // Reverted to the correct field name
  oficinaId?: string;
  enteId?: number; 
  pendienteCia?: boolean; // Flag to indicate company selection is pending
}

export interface LoginResponse {
  token: string;
  companias?: UsuarioCompania[]; // List of companies for selection
  needsSelection?: boolean; // True if user needs to select a company
}

@injectable()
export class AuthService {
  constructor(
    @inject(TYPES.UsuarioCompaniaRepository) private usuarioCompaniaRepo: UsuarioCompaniaRepository
  ) {}

  private signToken(payload: AuthPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions);
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

    const isSupervisor = userCompanias.some(uc => uc.rol === 'supervisor');
    if (isSupervisor || userCompanias.length === 1) {
      const primaryRelation = userCompanias[0];
      const payload: AuthPayload = {
        uid,
        email: email!,
        rol: primaryRelation.rol,
        companiaCorretajeId: primaryRelation.companiaCorretajeId, // Reverted to the correct field name
        oficinaId: primaryRelation.oficinaId,
        enteId: primaryRelation.enteId,
      };
      const token = this.signToken(payload);
      return { token, needsSelection: false };
    }

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
      rol: userCompania.rol,
      companiaCorretajeId: userCompania.companiaCorretajeId, // Reverted to the correct field name
      oficinaId: userCompania.oficinaId,
      enteId: userCompania.enteId,
    };

    const token = this.signToken(newPayload);
    return { token };
  }
}
