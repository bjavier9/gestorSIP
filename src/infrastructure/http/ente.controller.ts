import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { EnteService } from '../../application/ente.service';
import { TYPES } from '../../config/types';
import { EnteInput } from '../../domain/ente';
import { handleSuccess } from '../../utils/responseHandler';
import asyncHandler from 'express-async-handler';

@injectable()
export class EnteController {
  constructor(@inject(TYPES.EnteService) private enteService: EnteService) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const entes = await this.enteService.getAllEntes();
    handleSuccess(res, entes);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const ente = await this.enteService.getEnteById(req.params.id);
    handleSuccess(res, ente);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const newEnte = await this.enteService.createEnte(req.body as EnteInput);
    handleSuccess(res, newEnte, 201);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const updatedEnte = await this.enteService.updateEnte(req.params.id, req.body);
    handleSuccess(res, updatedEnte);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.enteService.deleteEnte(req.params.id);
    handleSuccess(res, null, 204);
  });
}
