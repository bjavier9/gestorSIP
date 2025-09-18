import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { EnteService } from '../../application/ente.service';
import { handleSuccess } from '../../utils/responseHandler';
import ApiError from '../../utils/ApiError';
import { EnteInput } from '../../domain/ports/enteRepository.port';

export class EnteController {
    constructor(private readonly enteService: EnteService) {}

    create = asyncHandler(async (req: Request, res: Response) => {
        const enteData: EnteInput = req.body;
        // Basic validation
        if (!enteData.nombre || !enteData.tipo) {
            throw new ApiError('VALIDATION_MISSING_FIELDS', 'Nombre and tipo are required');
        }
        const newEnte = await this.enteService.createEnte(enteData);
        handleSuccess(res, newEnte, 201);
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const ente = await this.enteService.getEnteById(id);
        handleSuccess(res, ente);
    });

    getAll = asyncHandler(async (req: Request, res: Response) => {
        const entes = await this.enteService.getAllEntes();
        handleSuccess(res, entes);
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const enteData: Partial<EnteInput> = req.body;
        const updatedEnte = await this.enteService.updateEnte(id, enteData);
        handleSuccess(res, updatedEnte);
    });

    delete = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        await this.enteService.deleteEnte(id);
        handleSuccess(res, { message: 'Ente deleted successfully' }, 204); // 204 No Content
    });
}
