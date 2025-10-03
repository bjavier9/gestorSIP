import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { EnteService } from '../../application/ente.service';
import { TYPES } from '../../config/types';
import { EnteInput, EnteUpdateInput } from '../../domain/ports/enteRepository.port';
import { handleSuccess } from '../../utils/responseHandler';

@injectable()
export class EnteController {
  constructor(@inject(TYPES.EnteService) private enteService: EnteService) {}

  async create(req: Request, res: Response): Promise<void> {
    const ente = await this.enteService.createEnte(req.body as EnteInput);
    handleSuccess(req, res, ente, 201);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const ente = await this.enteService.getEnteById(req.params.id);
    handleSuccess(req, res, ente);
  }

  async getAll(req: Request, res: Response): Promise<void> {
    const entes = await this.enteService.getAllEntes();
    handleSuccess(req, res, entes);
  }

  async update(req: Request, res: Response): Promise<void> {
    const ente = await this.enteService.updateEnte(req.params.id, req.body as EnteUpdateInput);
    handleSuccess(req, res, ente);
  }

  async delete(req: Request, res: Response): Promise<void> {
    await this.enteService.deleteEnte(req.params.id);
    handleSuccess(req, res, { message: 'Ente eliminado' });
  }
}
