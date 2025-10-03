
import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { AseguradoraService } from '../../application/aseguradora.service';
import { TYPES } from '../../config/types';

@injectable()
export class AseguradoraController {
    constructor(
        @inject(TYPES.AseguradoraService) private aseguradoraService: AseguradoraService
    ) {}

    async getAll(req: Request, res: Response): Promise<void> {
        const aseguradoras = await this.aseguradoraService.getAllAseguradoras();
        res.status(200).json(aseguradoras);
    }

    async getById(req: Request, res: Response): Promise<void> {
        const aseguradora = await this.aseguradoraService.getAseguradoraById(req.params.id);
        res.status(200).json(aseguradora);
    }

    async create(req: Request, res: Response): Promise<void> {
        const newAseguradora = await this.aseguradoraService.createAseguradora(req.body);
        res.status(201).json(newAseguradora);
    }

    async update(req: Request, res: Response): Promise<void> {
        const updatedAseguradora = await this.aseguradoraService.updateAseguradora(req.params.id, req.body);
        res.status(200).json(updatedAseguradora);
    }
}
