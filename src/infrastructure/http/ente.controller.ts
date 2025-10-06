import { Response } from 'express';
import { inject, injectable } from 'inversify';
import { EnteService } from '../../application/ente.service';
import { TYPES } from '../../config/types';
import { handleSuccess } from '../../utils/responseHandler';
import { ApiError } from '../../utils/ApiError';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';

@injectable()
export class EnteController {
  constructor(@inject(TYPES.EnteService) private enteService: EnteService) {}

  private getCompaniaId(req: AuthenticatedRequest): string {
    const companiaId = req.user?.user?.companiaCorretajeId;
    if (!companiaId) {
      throw new ApiError('FORBIDDEN', 'No se pudo determinar la compañía asociada al token.', 403);
    }
    return companiaId;
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    const companiaId = this.getCompaniaId(req);
    const ente = await this.enteService.create(companiaId, req.body);
    handleSuccess(req, res, ente, 201);
  }

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const companiaId = this.getCompaniaId(req);
    const ente = await this.enteService.getById(req.params.id, companiaId);
    if (!ente) {
      throw new ApiError('ENTE_NOT_FOUND', 'Ente no encontrado', 404);
    }
    handleSuccess(req, res, ente);
  }

  async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    const companiaId = this.getCompaniaId(req);
    const entes = await this.enteService.getAll(companiaId);
    handleSuccess(req, res, entes);
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    const companiaId = this.getCompaniaId(req);
    const ente = await this.enteService.update(req.params.id, companiaId, req.body);
    if (!ente) {
        throw new ApiError('ENTE_NOT_FOUND', 'Ente no encontrado para actualizar', 404);
    }
    handleSuccess(req, res, ente);
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    const companiaId = this.getCompaniaId(req);
    const result = await this.enteService.delete(req.params.id, companiaId);
    handleSuccess(req, res, result);
  }
}
