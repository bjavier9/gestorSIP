
import { CompaniaCorretaje } from '../companiaCorretaje';

export interface CompaniaCorretajeRepository {
  create(compania: Partial<CompaniaCorretaje>): Promise<CompaniaCorretaje>;
  findByRif(rif: string): Promise<CompaniaCorretaje | null>;

  /**
   * Finds the first available brokerage company.
   * Useful for initial setup or default assignments.
   * @returns A promise that resolves to the first company found, or null.
   */
  findFirst(): Promise<CompaniaCorretaje | null>;
}
