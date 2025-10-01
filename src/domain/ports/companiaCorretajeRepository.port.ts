import { CompaniaCorretaje } from '../companiaCorretaje';

export interface CompaniaCorretajeRepository {
  create(compania: CompaniaCorretaje): Promise<CompaniaCorretaje>;
  findByRif(rif: string): Promise<CompaniaCorretaje | null>;
  // Agrega otros métodos que necesites, como findById, findAll, etc.
}
