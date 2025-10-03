import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { AseguradoraService } from '../../application/aseguradora.service';
import { TYPES } from '../../config/types';
import { handleSuccess } from '../../utils/responseHandler';

@injectable()
export class AseguradoraController {
    constructor(
        @inject(TYPES.AseguradoraService) private aseguradoraService: AseguradoraService
    ) {}

    async getAll(req: Request, res: Response): Promise<void> {
        const aseguradoras = await this.aseguradoraService.getAllAseguradoras();
        handleSuccess(req, res, aseguradoras);
    }

    async getById(req: Request, res: Response): Promise<void> {
        const aseguradora = await this.aseguradoraService.getAseguradoraById(req.params.id);
        handleSuccess(req, res, aseguradora);
    }

    async create(req: Request, res: Response): Promise<void> {
        const newAseguradora = await this.aseguradoraService.createAseguradora(req.body);
        handleSuccess(req, res, newAseguradora, 201);
    }

    async update(req: Request, res: Response): Promise<void> {
        const updatedAseguradora = await this.aseguradoraService.updateAseguradora(req.params.id, req.body);
        handleSuccess(req, res, updatedAseguradora);
    }
}
