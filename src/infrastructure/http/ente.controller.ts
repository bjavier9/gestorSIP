import { Request, Response, NextFunction } from 'express';
import { EnteService } from '../../application/ente.service';
import { handleSuccess } from '../../utils/responseHandler';
import ApiError from '../../utils/ApiError';
import { EnteInput } from '../../domain/ports/enteRepository.port';

export class EnteController {
    constructor(private readonly enteService: EnteService) {}

    // Refactored back to arrow functions to preserve 'this' context.
    // The asyncHandler wrapper is removed from here and used only in the router.
    create = async (req: Request, res: Response): Promise<void> => {
        const enteData: EnteInput = req.body;
        if (!enteData.nombre || !enteData.tipo) {
            // asyncHandler in the router will catch this and pass it to next().
            throw new ApiError('VALIDATION_MISSING_FIELDS', 'Nombre and tipo are required');
        }
        const newEnte = await this.enteService.createEnte(enteData);
        handleSuccess(res, newEnte, 201);
    };

    getById = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const ente = await this.enteService.getEnteById(id);
        handleSuccess(res, ente);
    };

    getAll = async (req: Request, res: Response): Promise<void> => {
        const entes = await this.enteService.getAllEntes();
        handleSuccess(res, entes);
    };

    update = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const enteData: Partial<EnteInput> = req.body;
        const updatedEnte = await this.enteService.updateEnte(id, enteData);
        handleSuccess(res, updatedEnte);
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        await this.enteService.deleteEnte(id);
        handleSuccess(res, { message: 'Ente deleted successfully' }, 204);
    };
}
