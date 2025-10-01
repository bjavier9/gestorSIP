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
    handleSuccess(res, result, 201);
  }
}
