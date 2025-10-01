import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { CompaniaCorretajeService } from '../../application/companiaCorretaje.service';
import { handleSuccess } from '../../utils/responseHandler';
import { TYPES } from '../../config/types';
import { ApiError } from '../../utils/ApiError';

@injectable()
export class CompaniaCorretajeController {
  constructor(
    @inject(TYPES.CompaniaCorretajeService) private readonly companiaService: CompaniaCorretajeService
  ) {}

  async create(req: Request, res: Response) {
    const { nombre, rif } = req.body;

    if (!nombre || !rif) {
      throw new ApiError('VALIDATION_MISSING_FIELD', 400, 'Nombre and RIF are required.');
    }

    const result = await this.companiaService.createCompania(nombre, rif);
    handleSuccess(res, result, 201);
  }
}
