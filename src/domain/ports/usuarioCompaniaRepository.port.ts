
import { UsuarioCompania } from '../usuarioCompania';

export interface UsuarioCompaniaRepository {
  findById(id: string): Promise<UsuarioCompania | null>;
  findByUserId(userId: string): Promise<UsuarioCompania[]>;
  findByUserAndCompania(userId: string, companiaId: string): Promise<UsuarioCompania | null>;

  /**
   * Creates a new association between a user and a company.
   * @param data The data for the new association.
   * @returns A promise that resolves to the newly created UsuarioCompania object.
   */
  create(data: Partial<UsuarioCompania>): Promise<UsuarioCompania>;

  /**
   * Sets the active flag for the given user-company association.
   */
  setActive(id: string, active: boolean): Promise<UsuarioCompania>;
}
