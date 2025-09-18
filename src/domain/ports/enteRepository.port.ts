import { Ente } from "../ente";

// El tipo de entrada para crear/actualizar puede ser parcial
export type EnteInput = Omit<Ente, 'id' | 'fechaCreacion' | 'fechaActualizacion'> & { id?: string };

export interface EnteRepository {
  findById(id: string): Promise<Ente | null>;
  findAll(): Promise<Ente[]>;
  save(ente: EnteInput): Promise<Ente>;
  update(id: string, ente: Partial<EnteInput>): Promise<Ente | null>;
  delete(id: string): Promise<void>;
}
