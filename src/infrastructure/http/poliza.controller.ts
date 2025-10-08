import { Response } from 'express';
import { inject, injectable } from 'inversify';
import { PolizaService } from '../../application/poliza.service';
import { TYPES } from '../../di/types';
import { handleSuccess } from '../../utils/responseHandler';
import { ApiError } from '../../utils/ApiError';
import { PolizaSearchCriteria } from '../../domain/ports/polizaRepository.port';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';

/**
 * @swagger
 * tags:
 *   name: Polizas
 *   description: Gestion y consulta de polizas de seguros
 */
@injectable()
export class PolizaController {
    constructor(@inject(TYPES.PolizaService) private polizaService: PolizaService) {}

    private getCompaniaId(req: AuthenticatedRequest): string {
        const companiaId = req.user?.user?.companiaCorretajeId;
        if (!companiaId) {
            throw new ApiError('FORBIDDEN_COMPANY', 'No se pudo determinar la compania del usuario.', 403);
        }
        return companiaId;
    }

    private parseFechaVencimiento(value: unknown): Date | undefined {
        if (!value) {
            return undefined;
        }

        const parsed = new Date(String(value));
        if (Number.isNaN(parsed.getTime())) {
            throw new ApiError('INVALID_DATE', 'fechaVencimiento no tiene un formato valido.', 400);
        }

        return parsed;
    }

    /**
     * @swagger
     * /api/polizas:
     *   get:
     *     tags: [Polizas]
     *     summary: Listar polizas filtrando por criterios
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: agenteId
     *         schema:
     *           type: string
     *         description: Filtra por el identificador del agente
     *       - in: query
     *         name: estado
     *         schema:
     *           type: string
     *           example: ACTIVA
     *         description: Filtra por estado de la poliza
     *       - in: query
     *         name: fechaVencimiento
     *         schema:
     *           type: string
     *           format: date-time
     *         description: Retorna polizas que vencen en o antes de la fecha indicada
     *     responses:
     *       200:
     *         description: Polizas encontradas
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/SuccessResponse'
     *                 - type: object
     *                   properties:
     *                     body:
     *                       type: object
     *                       properties:
     *                         data:
     *                           type: array
     *                           items:
     *                             $ref: '#/components/schemas/Poliza'
     *       400:
     *         description: Parametros invalidos
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       403:
     *         description: Token sin compania asociada
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    async getByCriteria(req: AuthenticatedRequest, res: Response): Promise<Response> {
        const companiaCorretajeId = this.getCompaniaId(req);
        const { agenteId, estado, fechaVencimiento } = req.query;

        const criteria: PolizaSearchCriteria = {
            companiaCorretajeId,
            ...(agenteId ? { agenteId: String(agenteId) } : {}),
            ...(estado ? { estado: String(estado) } : {}),
        };

        const parsedFecha = this.parseFechaVencimiento(fechaVencimiento);
        if (parsedFecha) {
            criteria.fechaVencimiento = parsedFecha;
        }

        const polizas = await this.polizaService.getPolizasByCriteria(criteria);
        return handleSuccess(req, res, polizas);
    }

    /**
     * @swagger
     * /api/polizas/{id}:
     *   get:
     *     tags: [Polizas]
     *     summary: Obtener una poliza por id
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Identificador de la poliza
     *     responses:
     *       200:
     *         description: Poliza encontrada
     *         content:
     *           application/json:
     *             schema:
     *               allOf:
     *                 - $ref: '#/components/schemas/SuccessResponse'
     *                 - type: object
     *                   properties:
     *                     body:
     *                       type: object
     *                       properties:
     *                         data:
     *                           $ref: '#/components/schemas/Poliza'
     *       403:
     *         description: Token sin compania asociada
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       404:
     *         description: Poliza no encontrada
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    async getById(req: AuthenticatedRequest, res: Response): Promise<Response> {
        const companiaCorretajeId = this.getCompaniaId(req);
        const { id } = req.params;

        const poliza = await this.polizaService.getPolizaById(id, companiaCorretajeId);
        if (!poliza) {
            throw new ApiError('POLIZA_NOT_FOUND', 'Poliza no encontrada o no pertenece a la compania.', 404);
        }
        return handleSuccess(req, res, poliza);
    }
}