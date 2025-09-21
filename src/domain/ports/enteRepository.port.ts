
// src/domain/ports/enteRepository.port.ts

import { Ente } from '../ente';

// The input for creating an ente is the Ente object itself, but with the 'id' being optional.
// The repository implementation will be responsible for generating the ID.
export type EnteInput = Omit<Ente, 'id'> & { id?: string };

// For updates, most fields are optional.
export type EnteUpdateInput = Partial<Omit<Ente, 'id'>>;

/**
 * Port for the Ente repository.
 * This interface defines the contract that any storage adapter must implement.
 */
export interface EnteRepository {
  /**
   * Finds an Ente by its unique ID.
   * @param id The ID of the ente.
   * @returns A promise that resolves to the Ente or null if not found.
   */
  findById(id: string): Promise<Ente | null>;

  /**
   * Retrieves all entes.
   * @returns A promise that resolves to an array of Ente.
   */
  findAll(): Promise<Ente[]>;

  /**
   * Saves a new Ente to the repository.
   * The implementation should handle the discriminated union (EntePersonaNatural vs EntePersonaJuridica).
   * @param ente The Ente object to save.
   * @returns A promise that resolves to the saved Ente, including its new ID.
   */
  save(ente: EnteInput): Promise<Ente>;

  /**
   * Updates an existing Ente.
   * @param id The ID of the ente to update.
   * @param enteData The partial data to update.
   * @returns A promise that resolves to the updated Ente or null if not found.
   */
  update(id: string, enteData: EnteUpdateInput): Promise<Ente | null>;

  /**
   * Deletes an Ente by its ID.
   * @param id The ID of the ente to delete.
   * @returns A promise that resolves to true if deletion was successful, false otherwise.
   */
  delete(id: string): Promise<boolean>;

    /**
   * Finds an Ente by its document (documento).
   * @param documento The documento of the ente.
   * @returns A promise that resolves to the Ente or null if not found.
   */
    findByDocumento(documento: string): Promise<Ente | null>;
}
