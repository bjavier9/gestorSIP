import { inject, injectable } from 'inversify';
import { getAuth } from 'firebase-admin/auth';
import { UsuarioCompaniaRepository } from '../domain/ports/usuarioCompaniaRepository.port';
import { TYPES } from '../config/types';
import { ApiError } from '../utils/ApiError';
import { UsuarioCompania } from '../domain/usuarioCompania';

interface CreateUsuarioCompaniaDto {
  email: string;
  password: string;
  companiaCorretajeId: string;
  rol: 'admin' | 'supervisor' | 'agent' | 'viewer';
  enteId?: number;
  oficinaId?: string;
}

@injectable()
export class UsuarioCompaniaService {
  constructor(
    @inject(TYPES.UsuarioCompaniaRepository) private usuarioCompaniaRepo: UsuarioCompaniaRepository,
  ) {}

  async createUsuarioCompania(input: CreateUsuarioCompaniaDto): Promise<UsuarioCompania> {
    const allowedAssign = ['admin', 'supervisor', 'agent', 'viewer'];
    if (!allowedAssign.includes(input.rol)) {
      throw new ApiError('VALIDATION_INVALID_ROLE', 'Rol inválido para el nuevo usuario.', 400);
    }

    // 1) Crear usuario en Firebase Auth
    let userRecord;
    try {
      userRecord = await getAuth().createUser({
        email: input.email,
        password: input.password,
        emailVerified: false,
        disabled: false,
      });
    } catch (error: any) {
      throw new ApiError('AUTH_USER_CREATION_FAILED', error?.message || 'Failed to create Firebase Auth user.', 400, error);
    }

    // 2) Crear documento en usuarios_companias con id = uid
    const created = await this.usuarioCompaniaRepo.create({
      id: userRecord.uid,
      userId: userRecord.uid,
      email: input.email,
      companiaCorretajeId: input.companiaCorretajeId,
      rol: input.rol as any,
      activo: true,
      ...(input.enteId ? { enteId: input.enteId } : {}),
      ...(input.oficinaId ? { oficinaId: input.oficinaId } : {}),
    });

    return created;
  }

  async setActive(id: string, active: boolean): Promise<UsuarioCompania> {
    const existing = await this.usuarioCompaniaRepo.findById(id);
    if (!existing) {
      throw new ApiError('NOT_FOUND', 'UsuarioCompania no encontrado.', 404);
    }

    // Opcional: sincronizar con Firebase Auth
    try {
      await getAuth().updateUser(id, { disabled: !active });
    } catch (error: any) {
      // No bloquear por fallo de sync, pero informar
      throw new ApiError('AUTH_USER_UPDATE_FAILED', error?.message || 'Failed to update Firebase Auth user.', 400, error);
    }

    return this.usuarioCompaniaRepo.setActive(id, active);
  }
}
