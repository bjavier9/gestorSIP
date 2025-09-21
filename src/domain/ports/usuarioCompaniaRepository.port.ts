
// src/domain/ports/usuarioCompaniaRepository.port.ts

import { UsuarioCompania } from '../usuarioCompania';

export interface UsuarioCompaniaRepository {
  /**
   * Finds all company associations for a given user ID (Firebase UID).
   * @param userId The Firebase UID of the user.
   * @returns A promise that resolves to an array of UsuarioCompania objects.
   */
  findByUserId(userId: string): Promise<UsuarioCompania[]>;

  /**
   * Finds a specific company association for a user.
   * This is useful for validating that a user belongs to a specific company.
   * @param userId The Firebase UID of the user.
   * @param companiaId The ID of the brokerage company.
   * @returns A promise that resolves to the UsuarioCompania object or null if not found.
   */
  findByUserAndCompania(userId: string, companiaId: string): Promise<UsuarioCompania | null>;
}
