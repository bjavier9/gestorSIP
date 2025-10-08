
import { inject, injectable } from 'inversify';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UsuarioCompaniaRepository } from '../../domain/ports/usuarioCompaniaRepository.port';
import { TYPES } from '../../di/types';
import { ApiError } from '../../utils/ApiError';
import { UserRole } from '../../domain/entities/roles';
import { AuthPayload } from '../../domain/entities/auth';

const JWT_SECRET: string = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const TEST_TOKEN_SECRET = process.env.TEST_SECRET;

@injectable()
export class SessionService {
  constructor(
    @inject(TYPES.UsuarioCompaniaRepository) private usuarioCompaniaRepo: UsuarioCompaniaRepository
  ) {}

  public signToken(payload: object): string {
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
