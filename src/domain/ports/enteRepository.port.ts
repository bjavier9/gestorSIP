import { Ente } from "../ente";

// Input data for creating a new Ente
export type EnteInput = Omit<Ente, 'id' | 'fechaCreacion' | 'fechaActualizacion'>;

// Input data for updating an existing Ente (all fields are optional)
export type EnteUpdateInput = Partial<EnteInput>;

export interface EnteRepository {
    findById(id: string): Promise<Ente | null>;
    findByDocumento(documento: string): Promise<Ente | null>;
    findAll(): Promise<Ente[]>;
    save(data: EnteInput): Promise<Ente>;
    update(id: string, data: EnteUpdateInput): Promise<Ente | null>;
    delete(id: string): Promise<void>;
}
