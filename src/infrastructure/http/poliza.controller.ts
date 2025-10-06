import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { PolizaService } from '../../application/poliza.service';
import { TYPES } from '../../config/types';
import { handleSuccess } from '../../utils/responseHandler';
import { ApiError } from '../../utils/ApiError';
import { PolizaSearchCriteria } from '../../domain/ports/polizaRepository.port';

// Extendemos el tipo Request para incluir la propiedad user
interface AuthenticatedRequest extends Request {
    user?: {
        companiaCorretajeId: string;
        [key: string]: any;
    };
}

@injectable()
export class PolizaController {
    constructor(@inject(TYPES.PolizaService) private polizaService: PolizaService) {}

    private getCompaniaId(req: AuthenticatedRequest): string {
        const companiaId = req.user?.companiaCorretajeId;
        if (!companiaId) {
            throw new ApiError('No se pudo determinar la compañía del usuario.', 403, 'FORBIDDEN_COMPANY');
        }
        return companiaId;
    }

    async getByCriteria(req: AuthenticatedRequest, res: Response): Promise<Response> {
        const companiaCorretajeId = this.getCompaniaId(req);
        const { agenteId, estado, fechaVencimiento } = req.query;

        const criteria: PolizaSearchCriteria = {
            companiaCorretajeId,
            ...(agenteId && { agenteId: String(agenteId) }),
            ...(estado && { estado: String(estado) }),
            ...(fechaVencimiento && { fechaVencimiento: new Date(String(fechaVencimiento)) }),
        };

        const polizas = await this.polizaService.getPolizasByCriteria(criteria);
        return handleSuccess(req, res, polizas);
    }

    async getById(req: AuthenticatedRequest, res: Response): Promise<Response> {
        const companiaCorretajeId = this.getCompaniaId(req);
        const { id } = req.params;
        
        const poliza = await this.polizaService.getPolizaById(id, companiaCorretajeId);
        if (!poliza) {
            throw new ApiError('Póliza no encontrada o no pertenece a la compañía', 404, 'POLIZA_NOT_FOUND');
        }
        return handleSuccess(req, res, poliza);
    }
}
