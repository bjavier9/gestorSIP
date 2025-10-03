
import { UsuarioCompania } from '../usuarioCompania';

export interface UsuarioCompaniaRepository {
  findByUserId(userId: string): Promise<UsuarioCompania[]>;
  findByUserAndCompania(userId: string, companiaId: string): Promise<UsuarioCompania | null>;

  /**
   * Creates a new association between a user and a company.
   * @param data The data for the new association.
   * @returns A promise that resolves to the newly created UsuarioCompania object.
   */
  create(data: Partial<UsuarioCompania>): Promise<UsuarioCompania>;
}
