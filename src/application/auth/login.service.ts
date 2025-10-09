
import { inject, injectable } from 'inversify';
import { getAuth } from 'firebase-admin/auth';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UsuarioCompaniaRepository } from '../../domain/ports/usuarioCompaniaRepository.port';
import { TYPES } from '../../di/types';
import { ApiError } from '../../utils/ApiError';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { UserRole } from '../../domain/entities/roles';
import { AuthPayload, LoginResponse } from '../../domain/entities/auth';
import logger from '../../utils/logger';

const JWT_SECRET: string = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL;
const SUPERADMIN_UID = process.env.SUPERADMIN_UID;

@injectable()
export class LoginService {
    constructor(
        @inject(TYPES.UsuarioCompaniaRepository) private usuarioCompaniaRepo: UsuarioCompaniaRepository
    ) { }

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

    public async login(idToken: string): Promise<LoginResponse> {
        let decodedToken: DecodedIdToken;
        try {
            decodedToken = await getAuth().verifyIdToken(idToken);
        } catch (error) {
            throw new ApiError('AUTH_INVALID_FIREBASE_TOKEN', 'Invalid Firebase token.', 401, error);
        }

        const { uid, email } = decodedToken;
        logger.info(`Login attempt for user: ${email} (uid: ${uid})`);

        // Superadmin check
        if (email === SUPERADMIN_EMAIL && uid === SUPERADMIN_UID) {
            const payload: AuthPayload = {
                uid,
                email: email!,
                role: UserRole.SUPERADMIN,
            };
            const token = this.signToken({ user: payload });
            return { token, companias: [], needsSelection: false, isSuperAdmin: true };
        }

        // Regular user logic
        const userCompanias = await this.usuarioCompaniaRepo.findByUserId(uid);

        if (userCompanias.length === 0) {
            throw new ApiError('AUTH_NO_COMPANIES_ASSIGNED', 'User is not assigned to any company.', 403);
        }

        // User with a single company association
        if (userCompanias.length === 1) {
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

        // User with multiple companies, needs to select one
        const payload = { user: { uid, email: email!, pendienteCia: true } };
        const token = this.signToken(payload);

        return {
            token,
            companias: userCompanias,
            needsSelection: true,
        };
    }
}
