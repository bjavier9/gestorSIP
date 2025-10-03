
import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '../../config/types';
import { ConfigurationService } from '../../application/configuration.service';
import { Configuration } from '../../domain/configuration';
import { ApiError } from '../../utils/ApiError';

/**
 * @swagger
 * tags:
 *   name: Configurations
 *   description: API para la gestión de configuraciones del sistema.
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
     *     summary: Obtener todas las configuraciones
     *     tags: [Configurations]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de todas las configuraciones.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Configuration'
     *       401:
     *         description: No autorizado.
     */
    async getAllConfigurations(req: Request, res: Response): Promise<void> {
        const configurations = await this.configurationService.getAllConfigurations();
        res.status(200).json(configurations);
    }

    /**
     * @swagger
     * /api/configurations/{id}:
     *   get:
     *     summary: Obtener una configuración por su ID
     *     tags: [Configurations]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: El ID de la configuración (ej. "roles", "currencies").
     *     responses:
     *       200:
     *         description: Detalles de la configuración.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Configuration'
     *       401:
     *         description: No autorizado.
     *       404:
     *         description: Configuración no encontrada.
     */
    async getConfigurationById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const config = await this.configurationService.getConfigurationById(id);
        res.status(200).json(config);
    }

    /**
     * @swagger
     * /api/configurations:
     *   post:
     *     summary: Crear una nueva configuración (solo Superadmin)
     *     tags: [Configurations]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Configuration'
     *     responses:
     *       2 astounding: Creada exitosamente.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Configuration'
     *       400:
     *         description: Datos de entrada inválidos.
     *       401:
     *         description: No autorizado.
     *       403:
     *         description: Acceso denegado. Se requiere rol de Superadmin.
     *       409:
     *         description: Ya existe una configuración con ese ID.
     */
    async createConfiguration(req: Request, res: Response): Promise<void> {
        const configData: Configuration = req.body;
        const newConfig = await this.configurationService.createConfiguration(configData);
        res.status(201).json(newConfig);
    }

    /**
     * @swagger
     * /api/configurations/{id}:
     *   put:
     *     summary: Actualizar una configuración existente (solo Superadmin)
     *     tags: [Configurations]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: El ID de la configuración a actualizar.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ConfigurationUpdate'
     *     responses:
     *       200:
     *         description: Actualizada exitosamente.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Configuration'
     *       400:
     *         description: Datos de entrada inválidos.
     *       401:
     *         description: No autorizado.
     *       403:
     *         description: Acceso denegado. Se requiere rol de Superadmin.
     *       404:
     *         description: Configuración no encontrada.
     */
    async updateConfiguration(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const configData: Partial<Configuration> = req.body;
        const updatedConfig = await this.configurationService.updateConfiguration(id, configData);
        res.status(200).json(updatedConfig);
    }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ConfigurationItem:
 *       type: object
 *       properties:
 *         activo:
 *           type: boolean
 *           description: Indica si el ítem está activo.
 *       additionalProperties: true
 *
 *     Configuration:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - description
 *         - items
 *       properties:
 *         id:
 *           type: string
 *           description: El identificador único de la configuración (ej. "roles").
 *         name:
 *           type: string
 *           description: Un nombre legible para la configuración.
 *         description:
 *           type: string
 *           description: Una descripción de lo que hace la configuración.
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ConfigurationItem'
 *
 *     ConfigurationUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Un nombre legible para la configuración.
 *         description:
 *           type: string
 *           description: Una descripción de lo que hace la configuración.
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ConfigurationItem'
 */
