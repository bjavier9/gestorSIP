import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { EnteService } from '../../application/ente.service';
import { TYPES } from '../../config/types';
import { EnteInput, EnteUpdateInput } from '../../domain/ports/enteRepository.port';
import { handleSuccess } from '../../utils/responseHandler';
import { ApiError } from '../../utils/ApiError';

@injectable()
export class EnteController {
  constructor(@inject(TYPES.EnteService) private enteService: EnteService) {}

  async create(req: Request, res: Response): Promise<void> {
    const ente = await this.enteService.create(req.body as EnteInput);
    handleSuccess(req, res, ente, 201);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const ente = await this.enteService.getById(req.params.id);
    if (!ente) {
      throw new ApiError('ENTE_NOT_FOUND', 'Ente no encontrado', 404);
    }
    handleSuccess(req, res, ente);
  }

  async getAll(req: Request, res: Response): Promise<void> {
    const entes = await this.enteService.getAll();
    handleSuccess(req, res, entes);
  }

  async update(req: Request, res: Response): Promise<void> {
    const ente = await this.enteService.update(req.params.id, req.body as EnteUpdateInput);
    if (!ente) {
        throw new ApiError('ENTE_NOT_FOUND', 'Ente no encontrado para actualizar', 404);
    }
    handleSuccess(req, res, ente);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const result = await this.enteService.delete(req.params.id);
    if (!result) {
        throw new ApiError('ENTE_NOT_FOUND', 'Ente no encontrado para eliminar', 404);
    }
    handleSuccess(req, res, result);
  }
}
