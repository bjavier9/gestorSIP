import { Poliza } from '../poliza';

export interface PolizaSearchCriteria {
    companiaCorretajeId: string;
    agenteId?: string;
    estado?: string;
    fechaVencimiento?: Date;
}

export interface PolizaRepository {
    findByCriteria(criteria: PolizaSearchCriteria): Promise<Poliza[]>;
    findById(id: string, companiaCorretajeId: string): Promise<Poliza | null>;
    // Otros métodos como create, update, delete pueden ser añadidos después
}
