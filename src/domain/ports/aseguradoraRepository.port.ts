
import { Aseguradora } from '../entities/aseguradora';

export interface AseguradoraRepository {
  create(aseguradora: Omit<Aseguradora, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<Aseguradora>;
  findAll(): Promise<Aseguradora[]>;
  findById(id: string): Promise<Aseguradora | null>;
  update(id: string, updates: Partial<Omit<Aseguradora, 'id' | 'fechaCreacion'>>): Promise<Aseguradora | null>;
  // El borrado físico no se implementa, se usa la actualización para marcar como inactivo.
}
