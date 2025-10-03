import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../config/types';
import { UsuarioCompaniaService } from '../../application/usuarioCompania.service';
import { handleSuccess } from '../../utils/responseHandler';
import { ApiError } from '../../utils/ApiError';

@injectable()
export class UsuarioCompaniaController {
  constructor(
    @inject(TYPES.UsuarioCompaniaService) private readonly service: UsuarioCompaniaService,
  ) {}

  async create(req: Request, res: Response) {
    const { email, password, companiaCorretajeId, rol, enteId, oficinaId } = req.body || {};

    if (!email || !password || !companiaCorretajeId || !rol) {
      throw new ApiError('VALIDATION_MISSING_FIELDS', 'email, password, companiaCorretajeId, rol are required.', 400);
    }

    const result = await this.service.createUsuarioCompania({ email, password, companiaCorretajeId, rol, enteId, oficinaId });
    handleSuccess(res, result, 201);
  }

  async desactivar(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) throw new ApiError('VALIDATION_MISSING_FIELD', 'id is required.', 400);
    const result = await this.service.setActive(id, false);
    handleSuccess(res, result, 200);
  }

  async activar(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) throw new ApiError('VALIDATION_MISSING_FIELD', 'id is required.', 400);
    const result = await this.service.setActive(id, true);
    handleSuccess(res, result, 200);
  }
}

