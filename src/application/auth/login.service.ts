
import { inject, injectable } from 'inversify';
import { getAuth } from 'firebase-admin/auth';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UsuarioCompaniaRepository } from '../../domain/ports/usuarioCompaniaRepository.port';
import { CompaniaCorretajeRepository } from '../../domain/ports/companiaCorretajeRepository.port';
import { TYPES } from '../../di/types';
import { ApiError } from '../../utils/ApiError';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { UserRole } from '../../domain/entities/roles';
import { AuthPayload, LoginResponse } from '../../domain/entities/auth';

const JWT_SECRET: string = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL;
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;

@injectable()
export class LoginService {
    constructor(
        @inject(TYPES.UsuarioCompaniaRepository) private usuarioCompaniaRepo: UsuarioCompaniaRepository,
        @inject(TYPES.CompaniaCorretajeRepository) private companiaCorretajeRepo: CompaniaCorretajeRepository
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
}
