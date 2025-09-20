
import { Ente } from "../ente";

// Definiendo los tipos para la entrada de datos, separando creación de actualización
export type EnteInput = Omit<Ente, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>;
export type EnteUpdateInput = Partial<Omit<Ente, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>>;

export interface EnteRepository {
    save(ente: EnteInput): Promise<Ente>;
    findById(id: string): Promise<Ente | null>;
    findAll(): Promise<Ente[]>;
    update(id: string, ente: EnteUpdateInput): Promise<Ente | null>;
    delete(id: string): Promise<boolean>;
}
