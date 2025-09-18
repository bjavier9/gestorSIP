import { EnteRepository, EnteInput } from "../domain/ports/enteRepository.port";
import { Ente } from "../domain/ente";
import ApiError from "../utils/ApiError";

export class EnteService {
    constructor(private readonly enteRepository: EnteRepository) {}

    async createEnte(enteData: EnteInput): Promise<Ente> {
        // En el futuro, podríamos añadir lógica aquí, como validar campos
        // o asegurar que no exista un 'correo' duplicado antes de guardar.
        return this.enteRepository.save(enteData);
    }

    async getEnteById(id: string): Promise<Ente> {
        const ente = await this.enteRepository.findById(id);
        if (!ente) {
            throw new ApiError('NOT_FOUND', 'Ente not found');
        }
        return ente;
    }

    async getAllEntes(): Promise<Ente[]> {
        return this.enteRepository.findAll();
    }

    async updateEnte(id: string, enteData: Partial<EnteInput>): Promise<Ente> {
        const ente = await this.enteRepository.update(id, enteData);
        if (!ente) {
            throw new ApiError('NOT_FOUND', 'Ente not found');
        }
        return ente;
    }

    async deleteEnte(id: string): Promise<void> {
        await this.enteRepository.delete(id);
    }
}
