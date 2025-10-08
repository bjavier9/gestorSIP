import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '../../di/types';
import { ConfigurationService } from '../../application/configuration.service';
import { Configuration } from '../../domain/entities/configuration';
import { handleSuccess } from '../../utils/responseHandler';
import { ApiError } from '../../utils/ApiError';

/**
 * @swagger
 * tags:
 *   name: Configurations
 *   description: Mantenimiento de configuraciones del sistema.
 */
@injectable()
export class ConfigurationController {
    constructor(
        @inject(TYPES.ConfigurationService) private configurationService: ConfigurationService
    ) {}

    /**
     * @swagger
     * /api/configurations:
     *   get:
     *     tags: [Configurations]
     *     summary: Lista todas las configuraciones disponibles.
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Coleccion de configuraciones.
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
     *                             $ref: '#/components/schemas/Configuration'
     */
    async getAllConfigurations(req: Request, res: Response): Promise<void> {
        const configurations = await this.configurationService.getAllConfigurations();
        handleSuccess(req, res, configurations);
    }

    /**
     * @swagger
     * /api/configurations/{id}:
     *   get:
     *     tags: [Configurations]
     *     summary: Obtiene una configuracion por id.
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Identificador de la configuracion.
     *     responses:
     *       200:
     *         description: Configuracion encontrada.
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
     *                           $ref: '#/components/schemas/Configuration'
     *       404:
     *         description: Configuracion no encontrada.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    async getConfigurationById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const config = await this.configurationService.getConfigurationById(id);
        if (!config) {
            throw new ApiError('NOT_FOUND', `Configuration with id ${id} not found`, 404);
        }
        handleSuccess(req, res, config);
    }

    /**
     * @swagger
     * /api/configurations:
     *   post:
     *     tags: [Configurations]
     *     summary: Crea una configuracion.
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ConfigurationCreateRequest'
     *     responses:
     *       201:
     *         description: Configuracion creada.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SuccessResponse'
     */
    async createConfiguration(req: Request, res: Response): Promise<void> {
        const configData: Configuration = req.body;
        const newConfig = await this.configurationService.createConfiguration(configData);
        handleSuccess(req, res, newConfig, 201);
    }

    /**
     * @swagger
     * /api/configurations/{id}:
     *   put:
     *     tags: [Configurations]
     *     summary: Actualiza una configuracion existente.
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ConfigurationUpdateRequest'
     *     responses:
     *       200:
     *         description: Configuracion actualizada.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SuccessResponse'
     *       404:
     *         description: Configuracion no encontrada.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    async updateConfiguration(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const configData: Partial<Configuration> = req.body;
        const updatedConfig = await this.configurationService.updateConfiguration(id, configData);
        if (!updatedConfig) {
            throw new ApiError('NOT_FOUND', `Configuration with id ${id} not found`, 404);
        }
        handleSuccess(req, res, updatedConfig);
    }
}
