
import { inject, injectable } from 'inversify';
import { getAuth } from 'firebase-admin/auth';
import { UsuarioCompaniaRepository } from '../../domain/ports/usuarioCompaniaRepository.port';
import { EnteRepository } from '../../domain/ports/enteRepository.port';
import { TYPES } from '../../di/types';
import { ApiError } from '../../utils/ApiError';
import { UserRole } from '../../domain/entities/roles';
import { AuthPayload, RegisterUserInput, RegisterUserResult } from '../../domain/entities/auth';
import { UsuarioCompania } from '../../domain/entities/usuarioCompania';

const DEFAULT_PASSWORD = 'pass1234';

const ALLOWED_CREATOR_ROLES: ReadonlySet<UserRole> = new Set([UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.SUPERVISOR]);
const ASSIGNABLE_ROLES: ReadonlySet<UserRole> = new Set([UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.AGENT, UserRole.VIEWER]);

@injectable()
export class RegisterService {
    constructor(
        @inject(TYPES.UsuarioCompaniaRepository) private usuarioCompaniaRepo: UsuarioCompaniaRepository,
        @inject(TYPES.EnteRepository) private enteRepository: EnteRepository
    ) { }

    private normalizeRole(role?: string): UserRole | undefined {
        if (!role) {
            return undefined;
        }
        const normalized = role.toLowerCase();
        return (Object.values(UserRole) as string[]).includes(normalized)
            ? (normalized as UserRole)
            : undefined;
    }

    public async register(requestingUser: AuthPayload, input: RegisterUserInput): Promise<RegisterUserResult> {
        const requesterRole = this.normalizeRole(requestingUser.role);
        if (!requesterRole || !ALLOWED_CREATOR_ROLES.has(requesterRole)) {
            throw new ApiError('FORBIDDEN', 'No tienes permisos para registrar usuarios.', 403);
        }

        const targetRole = this.normalizeRole(input.rol);
        if (!targetRole || !ASSIGNABLE_ROLES.has(targetRole)) {
            throw new ApiError('VALIDATION_INVALID_ROLE', 'El rol solicitado no es vlido para nuevos usuarios.', 400);
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
                throw new ApiError('FORBIDDEN', 'Tu token no contiene una compaa asociada.', 403);
            }
            if (targetCompaniaId && targetCompaniaId !== requestingUser.companiaCorretajeId) {
                throw new ApiError('FORBIDDEN', 'No puedes registrar usuarios en otra compaa.', 403);
            }
            targetCompaniaId = requestingUser.companiaCorretajeId;
        }

        if (!targetCompaniaId) {
            throw new ApiError('VALIDATION_MISSING_FIELD', 'No se pudo determinar la compaa destino.', 400);
        }

        const ente = await this.enteRepository.findById(input.enteId);
        if (!ente) {
            throw new ApiError('ENTE_NOT_FOUND', `No se encontr un ente con id ${input.enteId}.`, 404);
        }

        if (!ente.companiaCorretajeId) {
            throw new ApiError('ENTE_INVALID', 'El ente no tiene una compaa asociada.', 400);
        }

        if (ente.companiaCorretajeId !== targetCompaniaId) {
            throw new ApiError('FORBIDDEN', 'El ente pertenece a una compaa distinta a la solicitada.', 403);
        }

        if (!ente.correo) {
            throw new ApiError('ENTE_INVALID', 'El ente no tiene un correo registrado.', 400);
        }

        const email = ente.correo.toLowerCase();

        try {
            await getAuth().getUserByEmail(email);
            throw new ApiError('AUTH_EMAIL_IN_USE', 'El correo ya est registrado en Firebase Auth.', 409);
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
            throw new ApiError('USUARIO_COMPANIA_CREATION_FAILED', error?.message || 'No se pudo crear la asociacin usuario-compaa.', 500, error);
        }
    }
}
