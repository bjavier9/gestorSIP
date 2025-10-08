import { Lead } from '../entities/lead';

export interface LeadRepository {
    create(lead: Omit<Lead, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<Lead>;
    findAllByCompania(companiaId: string): Promise<Lead[]>;
    findById(id: string): Promise<Lead | null>;
    update(id: string, updates: Partial<Lead>): Promise<Lead>;
    delete(id: string): Promise<void>;
}

