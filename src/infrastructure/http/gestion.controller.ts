import { Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { GestionService } from '../../application/gestion.service';
import { TYPES } from '../../config/types';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { ApiError } from '../../utils/ApiError';
import { handleSuccess } from '../../utils/responseHandler';
import { GestionPrioridad, GestionTipo } from '../../domain/gestion';

@injectable()
export class GestionController {
  constructor(
    @inject(TYPES.GestionService) private gestionService: GestionService,
  ) {}

  private getUserContext(req: AuthenticatedRequest) {
    const user = req.user?.user;
    if (!user) {
      throw new ApiError('UNAUTHENTICATED', 'Token invalido o ausente.', 401);
    }
    if (!user.companiaCorretajeId) {
      throw new ApiError('BAD_REQUEST', 'El token no contiene la compania del usuario.', 400);
    }
    return user;
  }

  public async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = this.getUserContext(req);
      const gestiones = await this.gestionService.getGestionesByCompania(user.companiaCorretajeId);
      handleSuccess(res, gestiones);
    } catch (error) {
      next(error);
    }
  }

  public async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = this.getUserContext(req);
      const gestion = await this.gestionService.getGestionById(req.params.id);
      if (gestion.companiaCorretajeId !== user.companiaCorretajeId) {
        throw new ApiError('FORBIDDEN', 'No tienes permiso para ver esta gestion.', 403);
      }
      handleSuccess(res, gestion);
    } catch (error) {
      next(error);
    }
  }

  public async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = this.getUserContext(req);
      const { role, uid } = user;
      const {
        leadId,
        enteId,
        agenteId: agenteIdBody,
        oficinaId,
        polizaId,
        tipo,
        estado,
        prioridad,
        notas,
        fechaVencimiento,
        activo,
      } = req.body || {};

      if (!tipo) {
        throw new ApiError('VALIDATION_MISSING_FIELD', 'tipo es requerido.', 400);
      }

      let agenteId = agenteIdBody as string | undefined;
      if (role?.toLowerCase() === 'agent') {
        agenteId = uid;
      }

      if (!agenteId) {
        throw new ApiError('VALIDATION_MISSING_FIELD', 'agenteId es requerido.', 400);
      }

      let parsedFechaVencimiento: Date | undefined;
      if (fechaVencimiento) {
        parsedFechaVencimiento = new Date(fechaVencimiento);
        if (Number.isNaN(parsedFechaVencimiento.getTime())) {
          throw new ApiError('VALIDATION_INVALID_FIELD', 'fechaVencimiento no tiene un formato valido.', 400);
        }
      }

      const nuevaGestion = await this.gestionService.createGestion({
        companiaCorretajeId: user.companiaCorretajeId,
        agenteId,
        oficinaId,
        polizaId,
        leadId,
        enteId,
        tipo: tipo as GestionTipo,
        estado,
        prioridad: prioridad as GestionPrioridad,
        notas,
        fechaVencimiento: parsedFechaVencimiento,
        activo,
      });

      handleSuccess(res, nuevaGestion, 201);
    } catch (error) {
      next(error);
    }
  }

  public async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = this.getUserContext(req);
      const gestion = await this.gestionService.getGestionById(req.params.id);
      if (gestion.companiaCorretajeId !== user.companiaCorretajeId) {
        throw new ApiError('FORBIDDEN', 'No tienes permiso para modificar esta gestion.', 403);
      }

      const role = user.role?.toLowerCase();
      if (role === 'agent' && gestion.agenteId !== user.uid) {
        throw new ApiError('FORBIDDEN', 'Un agente solo puede modificar sus propias gestiones.', 403);
      }

      const updates: any = { ...req.body };

      if (role === 'agent') {
        if (updates.agenteId && updates.agenteId !== user.uid) {
          throw new ApiError('FORBIDDEN', 'No puedes reasignar la gestion a otro agente.', 403);
        }
        updates.agenteId = user.uid;
      }

      if (Object.prototype.hasOwnProperty.call(updates, 'fechaVencimiento')) {
        if (updates.fechaVencimiento) {
          const parsed = new Date(updates.fechaVencimiento);
          if (Number.isNaN(parsed.getTime())) {
            throw new ApiError('VALIDATION_INVALID_FIELD', 'fechaVencimiento no tiene un formato valido.', 400);
          }
          updates.fechaVencimiento = parsed;
        } else if (updates.fechaVencimiento === null) {
          updates.fechaVencimiento = null;
        }
      }

      const updated = await this.gestionService.updateGestion(req.params.id, updates);
      handleSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }

  public async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = this.getUserContext(req);
      const gestion = await this.gestionService.getGestionById(req.params.id);
      if (gestion.companiaCorretajeId !== user.companiaCorretajeId) {
        throw new ApiError('FORBIDDEN', 'No tienes permiso para eliminar esta gestion.', 403);
      }

      const role = user.role?.toLowerCase();
      if (role === 'agent' && gestion.agenteId !== user.uid) {
        throw new ApiError('FORBIDDEN', 'Un agente solo puede eliminar sus propias gestiones.', 403);
      }

      await this.gestionService.deleteGestion(req.params.id);
      handleSuccess(res, { message: 'Gestion eliminada' });
    } catch (error) {
      next(error);
    }
  }
}
