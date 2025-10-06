import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { CompaniaCorretajeService } from '../../application/companiaCorretaje.service';
import { handleSuccess } from '../../utils/responseHandler';
import { TYPES } from '../../config/types';
import { ApiError } from '../../utils/ApiError';
import { CompaniaCorretaje } from '../../domain/companiaCorretaje';

@injectable()
export class CompaniaCorretajeController {
  constructor(
    @inject(TYPES.CompaniaCorretajeService) private readonly companiaService: CompaniaCorretajeService
  ) {}

  async create(req: Request, res: Response) {
    const companiaData: CompaniaCorretaje = req.body;

    if (!companiaData.nombre || !companiaData.rif) {
      throw new ApiError('VALIDATION_MISSING_FIELD', 'Nombre and RIF are required.', 400);
    }

    const result = await this.companiaService.createCompania(companiaData);
    handleSuccess(req, res, result, 201);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      throw new ApiError('VALIDATION_MISSING_FIELD', 'id is required.', 400);
    }
    const result = await this.companiaService.getCompaniaById(id);
    handleSuccess(req, res, result);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const data: Partial<CompaniaCorretaje> = req.body;

    if (!id) {
      throw new ApiError('VALIDATION_MISSING_FIELD', 'id is required.', 400);
    }

    const result = await this.companiaService.updateCompania(id, data);
    handleSuccess(req, res, result, 200);
  }

  async activar(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      throw new ApiError('VALIDATION_MISSING_FIELD', 'id is required.', 400);
    }
    const result = await this.companiaService.activarCompania(id);
    handleSuccess(req, res, result, 200);
  }

  async desactivar(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      throw new ApiError('VALIDATION_MISSING_FIELD', 'id is required.', 400);
    }
    const result = await this.companiaService.desactivarCompania(id);
    handleSuccess(req, res, result, 200);
  }
}
