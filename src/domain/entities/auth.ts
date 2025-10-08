import { UsuarioCompania } from './usuarioCompania';
import { UserRole } from './roles';

/**
 * Payload decodificado del token JWT, representa la identidad del usuario en el sistema.
 */
export interface AuthPayload {
  uid: string;
  email: string;
  role?: UserRole;
  companiaCorretajeId?: string;
  oficinaId?: string;
  enteId?: string;
  pendienteCia?: boolean; // Indica si el usuario necesita seleccionar una compañía
}

/**
 * Respuesta del endpoint de login.
 */
export interface LoginResponse {
  token: string;
  companias: UsuarioCompania[];
  needsSelection: boolean;
}

/**
 * DTO para el registro de un nuevo usuario.
 */
export interface RegisterUserInput {
  enteId: string;
  rol: string;
  companiaCorretajeId?: string;
  oficinaId?: string;
}

/**
 * DTO con el resultado del registro de un nuevo usuario.
 */
export interface RegisterUserResult {
  uid: string;
  email: string;
  defaultPassword: string;
  usuarioCompaniaId: string;
}
