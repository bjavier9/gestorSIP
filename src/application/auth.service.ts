
import { inject, injectable } from 'inversify';
import { getAuth } from 'firebase-admin/auth';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UsuarioCompaniaRepository } from '../domain/ports/usuarioCompaniaRepository.port';
import { CompaniaCorretajeRepository } from '../domain/ports/companiaCorretajeRepository.port';
import { TYPES } from '../config/types';
import { ApiError } from '../utils/ApiError';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { UsuarioCompania } from '../domain/usuarioCompania';

const JWT_SECRET: string = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL;
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;
const TEST_TOKEN_SECRET = process.env.TEST_SECRET;

export interface AuthPayload {
  uid: string;
  email: string;
  role?: 'superadmin' | 'admin' | 'supervisor' | 'agent' | 'viewer';
  companiaCorretajeId?: string;
  oficinaId?: string;
  enteId?: number;
  pendienteCia?: boolean;
}

export interface LoginResponse {
  token: string;
  companias: UsuarioCompania[];
  needsSelection: boolean;
}

@injectable()
export class AuthService {
  constructor(
    @inject(TYPES.UsuarioCompaniaRepository) private usuarioCompaniaRepo: UsuarioCompaniaRepository,
    @inject(TYPES.CompaniaCorretajeRepository) private companiaCorretajeRepo: CompaniaCorretajeRepository
  ) {}

  private signToken(payload: object): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions);
  }

  public async loginSuperAdmin(email: string, password: string): Promise<{ token: string }> {
    if (!SUPERADMIN_EMAIL || !SUPERADMIN_PASSWORD) {
      throw new ApiError('CONFIG_ERROR', 'Super admin credentials are not configured on the server.', 500);
    }

    if (email !== SUPERADMIN_EMAIL || password !== SUPERADMIN_PASSWORD) {
      throw new ApiError('AUTH_INVALID_CREDENTIALS', 'Invalid superadmin credentials.', 401);
    }

    const payload: AuthPayload = {
      uid: 'superadmin-uid',
      email: SUPERADMIN_EMAIL,
      role: 'superadmin',
    };

    const token = this.signToken({ user: payload });
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
    let userCompanias = await this.usuarioCompaniaRepo.findByUserId(uid);

    if (userCompanias.length === 0 && email === 'admin@seguroplus.com') {
      const firstCompany = await this.companiaCorretajeRepo.findFirst();
      if (firstCompany) {
        const newAssociation = await this.usuarioCompaniaRepo.create({
          userId: uid,
          email: email!,
          companiaCorretajeId: firstCompany.id,
          rol: 'admin',
        });
        userCompanias = [newAssociation];
      } else {
        throw new ApiError('AUTH_NO_COMPANIES_AVAILABLE', 'No companies available for assignment.', 500);
      }
    }

    if (userCompanias.length === 0) {
      throw new ApiError('AUTH_NO_COMPANIES_ASSIGNED', 'User is not assigned to any company.', 403);
    }

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
      return { token, companias: userCompanias, needsSelection: false };
    }

    const payload = { user: { uid, email: email!, pendienteCia: true } };
    const token = this.signToken(payload);

    return {
      token,
      companias: userCompanias,
      needsSelection: true,
    };
  }

  public async register(idToken: string): Promise<any> {
    let decodedToken: DecodedIdToken;
    try {
      decodedToken = await getAuth().verifyIdToken(idToken);
    } catch (error) {
      throw new ApiError('AUTH_INVALID_FIREBASE_TOKEN', 'Invalid Firebase token.', 401);
    }

    const { uid, email } = decodedToken;

    // TODO: Implementar la lógica de registro de usuario aquí.
    // 1. Verificar si el usuario ya existe en la base de datos.
    // 2. Si no existe, crear la asociación de usuario-compañía inicial, etc.
    console.log(`Registration attempt for UID: ${uid}, Email: ${email}`);

    // Devolver un objeto provisional. La implementación real será más compleja.
    return { status: "registration_pending", uid };
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
    if (!TEST_TOKEN_SECRET) {
      throw new ApiError('CONFIG_ERROR', 'TEST_SECRET is not configured on the server.', 500);
    }

    if (secret !== TEST_TOKEN_SECRET) {
      throw new ApiError('AUTH_INVALID_SECRET', 'Invalid secret for test token.', 401);
    }

    const testPayload: AuthPayload = {
      uid: 'test-admin-uid',
      email: 'test-admin@example.com',
      role: 'admin',
      companiaCorretajeId: 'test-company-id',
    };

    const token = this.signToken({ user: testPayload });
    return { token };
  }
}
