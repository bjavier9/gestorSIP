import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { EnteService } from '../../application/ente.service';
import { TYPES } from '../../config/types';
import { EnteInput, EnteUpdateInput } from '../../domain/ports/enteRepository.port';

@injectable()
export class EnteController {
  constructor(@inject(TYPES.EnteService) private enteService: EnteService) {}

  async create(req: Request, res: Response): Promise<void> {
    const ente = await this.enteService.createEnte(req.body as EnteInput);
    res.status(201).json(ente);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const ente = await this.enteService.getEnteById(req.params.id);
    res.status(200).json(ente);
  }

  async getAll(req: Request, res: Response): Promise<void> {
    const entes = await this.enteService.getAllEntes();
    res.status(200).json(entes);
  }

  async update(req: Request, res: Response): Promise<void> {
    const ente = await this.enteService.updateEnte(req.params.id, req.body as EnteUpdateInput);
    res.status(200).json(ente);
  }

  async delete(req: Request, res: Response): Promise<void> {
    await this.enteService.deleteEnte(req.params.id);
    res.status(204).send();
  }
}
