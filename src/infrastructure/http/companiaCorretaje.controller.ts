import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { CompaniaCorretajeService } from '../../application/companiaCorretaje.service';
import { handleSuccess } from '../../utils/responseHandler';
import { TYPES } from '../../di/types';
import { ApiError } from '../../utils/ApiError';
import { CompaniaCorretaje } from '../../domain/entities/companiaCorretaje';

/**
 * @swagger
 * tags:
 *   name: Companias Corretaje (Superadmin)
 *   description: Administración de Compañías de Corretaje. Acceso restringido a Superadministradores.
 */
@injectable()
export class CompaniaCorretajeController {
  constructor(
    @inject(TYPES.CompaniaCorretajeService) private readonly companiaService: CompaniaCorretajeService
  ) {}

  /**
   * @swagger
   * /api/companias:
   *   get:
   *     tags: [Companias Corretaje (Superadmin)]
   *     summary: Obtiene una lista de todas las compañías de corretaje.
   *     description: Ruta exclusiva para Superadministradores.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de compañías obtenida con éxito.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 body:
   *                   type: object
   *                   properties:
   *                     data:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/CompaniaCorretaje'
   *       401:
   *         description: No autorizado (token no válido o no proporcionado).
   *       403:
   *         description: Prohibido (el usuario no es Superadmin).
   */
  async getAll(req: Request, res: Response) {
    const result = await this.companiaService.getAllCompanias();
    handleSuccess(req, res, result);
  }

  /**
   * @swagger
   * /api/companias:
   *   post:
   *     tags: [Companias Corretaje (Superadmin)]
   *     summary: Crea una nueva compañía de corretaje.
   *     description: Ruta exclusiva para Superadministradores.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CompaniaCorretaje'
   *     responses:
   *       201:
   *         description: Compañía creada correctamente.
   *       400:
   *         description: Datos faltantes o inválidos (ej. RIF duplicado).
   *       403:
   *         description: Prohibido (el usuario no es Superadmin).
   */
  async create(req: Request, res: Response) {
    const companiaData: CompaniaCorretaje = req.body;
    if (!companiaData.nombre || !companiaData.rif) {
      throw new ApiError('VALIDATION_MISSING_FIELD', 'Nombre and RIF are required.', 400);
    }
    const result = await this.companiaService.createCompania(companiaData);
    handleSuccess(req, res, result, 201);
  }

  /**
   * @swagger
   * /api/companias/{id}:
   *   get:
   *     tags: [Companias Corretaje (Superadmin)]
   *     summary: Obtiene una compañía específica por su ID.
   *     description: Ruta exclusiva para Superadministradores.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Identificador único de la compañía.
   *     responses:
   *       200:
   *         description: Compañía encontrada.
   *       403:
   *         description: Prohibido (el usuario no es Superadmin).
   *       404:
   *         description: Compañía no encontrada.
   */
  async getById(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      throw new ApiError('VALIDATION_MISSING_FIELD', 'id is required.', 400);
    }
    const result = await this.companiaService.getCompaniaById(id);
    handleSuccess(req, res, result);
  }

  /**
   * @swagger
   * /api/companias/{id}:
   *   put:
   *     tags: [Companias Corretaje (Superadmin)]
   *     summary: Actualiza los datos de una compañía existente.
   *     description: Ruta exclusiva para Superadministradores.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Identificador de la compañía a actualizar.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CompaniaCorretaje'
   *     responses:
   *       200:
   *         description: Compañía actualizada correctamente.
   *       403:
   *         description: Prohibido (el usuario no es Superadmin).
   *       404:
   *         description: Compañía no encontrada.
   */
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const data: Partial<CompaniaCorretaje> = req.body;
    if (!id) {
      throw new ApiError('VALIDATION_MISSING_FIELD', 'id is required.', 400);
    }
    const result = await this.companiaService.updateCompania(id, data);
    handleSuccess(req, res, result, 200);
  }

  /**
   * @swagger
   * /api/companias/{id}/activar:
   *   put:
   *     tags: [Companias Corretaje (Superadmin)]
   *     summary: Activa una compañía.
   *     description: Ruta exclusiva para Superadministradores.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Identificador de la compañía a activar.
   *     responses:
   *       200:
   *         description: Compañía activada.
   *       403:
   *         description: Prohibido (el usuario no es Superadmin).
   *       404:
   *         description: Compañía no encontrada.
   */
  async activar(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      throw new ApiError('VALIDATION_MISSING_FIELD', 'id is required.', 400);
    }
    const result = await this.companiaService.activarCompania(id);
    handleSuccess(req, res, result, 200);
  }

  /**
   * @swagger
   * /api/companias/{id}/desactivar:
   *   put:
   *     tags: [Companias Corretaje (Superadmin)]
   *     summary: Desactiva una compañía.
   *     description: Ruta exclusiva para Superadministradores.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Identificador de la compañía a desactivar.
   *     responses:
   *       200:
   *         description: Compañía desactivada.
   *       403:
   *         description: Prohibido (el usuario no es Superadmin).
   *       404:
   *         description: Compañía no encontrada.
   */
  async desactivar(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      throw new ApiError('VALIDATION_MISSING_FIELD', 'id is required.', 400);
    }
    const result = await this.companiaService.desactivarCompania(id);
    handleSuccess(req, res, result, 200);
  }
}
