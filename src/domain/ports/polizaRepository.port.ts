import { Poliza } from '../poliza';

export interface PolizaRepository {
    findAll(): Promise<Poliza[]>;
    findById(id: string): Promise<Poliza | null>;
    // Otros métodos como create, update, delete pueden ser añadidos después
}
