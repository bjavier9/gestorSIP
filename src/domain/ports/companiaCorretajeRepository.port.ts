
import { CompaniaCorretaje } from '../companiaCorretaje';

export interface CompaniaCorretajeRepository {
  create(compania: Partial<CompaniaCorretaje>): Promise<CompaniaCorretaje>;
  findByRif(rif: string): Promise<CompaniaCorretaje | null>;
  findById(id: string): Promise<CompaniaCorretaje | null>;
  update(id: string, data: Partial<CompaniaCorretaje>): Promise<CompaniaCorretaje>;
  setActive(id: string, active: boolean): Promise<CompaniaCorretaje>;

  /**
   * Finds the first available brokerage company.
   * Useful for initial setup or default assignments.
   * @returns A promise that resolves to the first company found, or null.
   */
  findFirst(): Promise<CompaniaCorretaje | null>;
}
