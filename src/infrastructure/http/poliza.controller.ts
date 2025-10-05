import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { PolizaService } from '../../application/poliza.service';
import { TYPES } from '../../config/types';
import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';

@injectable()
export class PolizaController {
    constructor(@inject(TYPES.PolizaService) private polizaService: PolizaService) {}

    async getAll(req: Request, res: Response): Promise<Response> {
        const polizas = await this.polizaService.getAllPolizas();
        return ApiResponse.success(res, polizas);
    }

    async getById(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const poliza = await this.polizaService.getPolizaById(id);
        if (!poliza) {
            throw new ApiError('Póliza no encontrada', 404, 'POLIZA_NOT_FOUND');
        }
        return ApiResponse.success(res, poliza);
    }
}
