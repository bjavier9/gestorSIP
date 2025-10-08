import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../di/types';
import { UsuarioCompaniaService } from '../../application/usuarioCompania.service';
import { handleSuccess } from '../../utils/responseHandler';
import { ApiError } from '../../utils/ApiError';

/**
 * @swagger
 * tags:
 *   name: UsuariosCompania
 *   description: Administracion de usuarios relacionados con companias de corretaje.
 */
@injectable()
export class UsuarioCompaniaController {
  constructor(
    @inject(TYPES.UsuarioCompaniaService) private readonly service: UsuarioCompaniaService,
  ) {}

  /**
   * @swagger
   * /api/usuarios-companias:
   *   post:
   *     tags: [UsuariosCompania]
   *     summary: Crea un usuario-compania en Firebase y lo asocia a una compania.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [email, password, companiaCorretajeId, rol]
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *               companiaCorretajeId:
   *                 type: string
   *               rol:
   *                 type: string
   *               enteId:
   *                 type: string
   *                 nullable: true
   *               oficinaId:
   *                 type: string
   *                 nullable: true
   *     responses:
   *       201:
   *         description: Usuario-compania creado.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *       400:
   *         description: Datos faltantes.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async create(req: Request, res: Response) {
    const { email, password, companiaCorretajeId, rol, enteId, oficinaId } = req.body || {};

    if (!email || !password || !companiaCorretajeId || !rol) {
      throw new ApiError('VALIDATION_MISSING_FIELDS', 'email, password, companiaCorretajeId, rol are required.', 400);
    }

    const result = await this.service.createUsuarioCompania({ email, password, companiaCorretajeId, rol, enteId, oficinaId });
    handleSuccess(req, res, result, 201);
  }

  /**
   * @swagger
   * /api/usuarios-companias/{id}:
   *   get:
   *     tags: [UsuariosCompania]
   *     summary: Obtiene la informacion de un usuario-compania por su identificador.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Informacion del usuario-compania.
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
   *                           $ref: '#/components/schemas/UsuarioCompania'
   *       400:
   *         description: Falta el identificador.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  async getById(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
        throw new ApiError('VALIDATION_MISSING_FIELD', 'id is required.', 400);
    }
    const result = await this.service.getById(id);
    handleSuccess(req, res, result);
  }

  async desactivar(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) throw new ApiError('VALIDATION_MISSING_FIELD', 'id is required.', 400);
    const result = await this.service.setActive(id, false);
    handleSuccess(req, res, result, 200);
  }

  async activar(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) throw new ApiError('VALIDATION_MISSING_FIELD', 'id is required.', 400);
    const result = await this.service.setActive(id, true);
    handleSuccess(req, res, result, 200);
  }
}
