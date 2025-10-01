import { CompaniaCorretaje } from '../companiaCorretaje';

export interface CompaniaCorretajeRepository {
  create(compania: CompaniaCorretaje): Promise<CompaniaCorretaje>;
  // Agrega otros métodos que necesites, como findById, findAll, etc.
}
