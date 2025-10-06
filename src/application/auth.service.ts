
import { inject, injectable } from 'inversify';
import { getAuth } from 'firebase-admin/auth';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UsuarioCompaniaRepository } from '../domain/ports/usuarioCompaniaRepository.port';
import { CompaniaCorretajeRepository } from '../domain/ports/companiaCorretajeRepository.port';
import { TYPES } from '../config/types';
import { ApiError } from '../utils/ApiError';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { UsuarioCompania } from '../domain/usuarioCompania';
import { EnteRepository } from '../domain/ports/enteRepository.port';
import { UserRole } from '../domain/roles';

const JWT_SECRET: string = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL;
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;
const TEST_TOKEN_SECRET = process.env.TEST_SECRET;
const DEFAULT_PASSWORD = 'pass1234';

const ALLOWED_CREATOR_ROLES: ReadonlySet<UserRole> = new Set([UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.SUPERVISOR]);
const ASSIGNABLE_ROLES: ReadonlySet<UserRole> = new Set([UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.AGENT, UserRole.VIEWER]);

export interface AuthPayload {
  uid: string;
  email: string;
  role?: UserRole;
  companiaCorretajeId?: string;
  oficinaId?: string;
  enteId?: string;
  pendienteCia?: boolean;
}

export interface LoginResponse {
  token: string;
  companias: UsuarioCompania[];
  needsSelection: boolean;
}

export interface RegisterUserInput {
  enteId: string;
  rol: string;
  companiaCorretajeId?: string;
  oficinaId?: string;
}

interface RegisterUserResult {
  uid: string;
  email: string;
  defaultPassword: string;
  usuarioCompaniaId: string;
}

@injectable()
export class AuthService {
  constructor(
    @inject(TYPES.UsuarioCompaniaRepository) private usuarioCompaniaRepo: UsuarioCompaniaRepository,
    @inject(TYPES.CompaniaCorretajeRepository) private companiaCorretajeRepo: CompaniaCorretajeRepository,
    @inject(TYPES.EnteRepository) private enteRepository: EnteRepository
  ) {}

  private signToken(payload: object): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions);
  }

  private normalizeRole(role?: string): UserRole | undefined {
    if (!role) {
      return undefined;
    }
    const normalized = role.toLowerCase();
    return (Object.values(UserRole) as string[]).includes(normalized)
      ? (normalized as UserRole)
      : undefined;
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
      role: UserRole.SUPERADMIN,
    };

    const token = this.signToken({ user: payload });
    return { token };
  }

  public async login(idToken: string): Promise<LoginResponse> {
    let decodedToken: DecodedIdToken;
    try {
      decodedToken = await getAuth().verifyIdToken(idToken);
    } catch (error) {
      throw new ApiError('AUTH_INVALID_FIREBASE_TOKEN', 'Invalid Firebase token.', 401, error);
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
        role: this.normalizeRole(primaryRelation.rol) ?? UserRole.VIEWER,
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

  public async register(requestingUser: AuthPayload, input: RegisterUserInput): Promise<RegisterUserResult> {
    const requesterRole = this.normalizeRole(requestingUser.role);
    if (!requesterRole || !ALLOWED_CREATOR_ROLES.has(requesterRole)) {
      throw new ApiError('FORBIDDEN', 'No tienes permisos para registrar usuarios.', 403);
    }

    const targetRole = this.normalizeRole(input.rol);
    if (!targetRole || !ASSIGNABLE_ROLES.has(targetRole)) {
      throw new ApiError('VALIDATION_INVALID_ROLE', 'El rol solicitado no es válido para nuevos usuarios.', 400);
    }

    if (!input.enteId) {
      throw new ApiError('VALIDATION_MISSING_FIELD', 'enteId es requerido.', 400);
    }

    let targetCompaniaId = input.companiaCorretajeId;
    if (requesterRole === UserRole.SUPERADMIN) {
      if (!targetCompaniaId) {
        throw new ApiError('VALIDATION_MISSING_FIELD', 'companiaCorretajeId es requerido para registrar usuarios.', 400);
      }
    } else {
      if (!requestingUser.companiaCorretajeId) {
        throw new ApiError('FORBIDDEN', 'Tu token no contiene una compañía asociada.', 403);
      }
      if (targetCompaniaId && targetCompaniaId !== requestingUser.companiaCorretajeId) {
        throw new ApiError('FORBIDDEN', 'No puedes registrar usuarios en otra compañía.', 403);
      }
      targetCompaniaId = requestingUser.companiaCorretajeId;
    }

    if (!targetCompaniaId) {
      throw new ApiError('VALIDATION_MISSING_FIELD', 'No se pudo determinar la compañía destino.', 400);
    }

    const ente = await this.enteRepository.findById(input.enteId);
    if (!ente) {
      throw new ApiError('ENTE_NOT_FOUND', `No se encontró un ente con id ${input.enteId}.`, 404);
    }

    if (!ente.companiaCorretajeId) {
      throw new ApiError('ENTE_INVALID', 'El ente no tiene una compañía asociada.', 400);
    }

    if (ente.companiaCorretajeId !== targetCompaniaId) {
      throw new ApiError('FORBIDDEN', 'El ente pertenece a una compañía distinta a la solicitada.', 403);
    }

    if (!ente.correo) {
      throw new ApiError('ENTE_INVALID', 'El ente no tiene un correo registrado.', 400);
    }

    const email = ente.correo.toLowerCase();

    try {
      await getAuth().getUserByEmail(email);
      throw new ApiError('AUTH_EMAIL_IN_USE', 'El correo ya está registrado en Firebase Auth.', 409);
    } catch (error: any) {
      if (error.code && error.code !== 'auth/user-not-found') {
        throw new ApiError('AUTH_USER_LOOKUP_FAILED', error.message || 'No se pudo verificar el correo en Firebase Auth.', 400, error);
      }
    }

    let userRecord;
    try {
      userRecord = await getAuth().createUser({
        email,
        password: DEFAULT_PASSWORD,
        displayName: ente.nombre,
        disabled: false,
      });
    } catch (error: any) {
      throw new ApiError('AUTH_USER_CREATION_FAILED', error?.message || 'No se pudo crear el usuario en Firebase Auth.', 400, error);
    }

    try {
      const association = await this.usuarioCompaniaRepo.create({
        userId: userRecord.uid,
        email,
        companiaCorretajeId: targetCompaniaId,
        rol: targetRole as UsuarioCompania['rol'],
        enteId: ente.id,
        ...(input.oficinaId ? { oficinaId: input.oficinaId } : {}),
      });

      return {
        uid: userRecord.uid,
        email,
        defaultPassword: DEFAULT_PASSWORD,
        usuarioCompaniaId: association.id,
      };
    } catch (error: any) {
      await getAuth().deleteUser(userRecord.uid).catch(() => undefined);
      throw new ApiError('USUARIO_COMPANIA_CREATION_FAILED', error?.message || 'No se pudo crear la asociación usuario-compañía.', 500, error);
    }
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
      role: this.normalizeRole(userCompania.rol) ?? UserRole.VIEWER,
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
      role: UserRole.ADMIN,
      companiaCorretajeId: 'test-company-id',
    };

    const token = this.signToken({ user: testPayload });
    return { token };
  }
}
