import { CompaniaCorretaje } from '../entities/companiaCorretaje';

export interface CompaniaCorretajeRepository {
  create(compania: Partial<CompaniaCorretaje>): Promise<CompaniaCorretaje>;
  findByRif(rif: string): Promise<CompaniaCorretaje | null>;
  findById(id: string): Promise<CompaniaCorretaje | null>;
  findAll(): Promise<CompaniaCorretaje[]>;
  findFirst(): Promise<CompaniaCorretaje | null>;
  update(id: string, data: Partial<CompaniaCorretaje>): Promise<CompaniaCorretaje>;
  setActive(id: string, active: boolean): Promise<CompaniaCorretaje>;
}
