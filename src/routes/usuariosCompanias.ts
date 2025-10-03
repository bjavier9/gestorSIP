import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { authMiddleware, adminSupervisorOrSuperadminMiddleware } from '../middleware/authMiddleware';
import container from '../config/container';
import { TYPES } from '../config/types';
import { UsuarioCompaniaController } from '../infrastructure/http/usuarioCompania.controller';

const controller = container.get<UsuarioCompaniaController>(TYPES.UsuarioCompaniaController);
const router = Router();

/**
 * @swagger
 * /api/usuarios-companias:
 *   post:
 *     tags: [Usuarios Companias]
 *     summary: Crear usuario-compania (y usuario de Firebase Auth)
 *     description: Crea un usuario en Firebase Authentication y un documento en la coleccion usuarios_companias con el mismo uid.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, companiaCorretajeId, rol]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               companiaCorretajeId: { type: string }
 *               rol: { type: string, enum: ['admin','supervisor','agent','viewer'] }
 *               enteId: { type: integer }
 *               oficinaId: { type: string }
 *           examples:
 *             default:
 *               value:
 *                 email: "nuevo.usuario@example.com"
 *                 password: "password123!"
 *                 companiaCorretajeId: "comp_001"
 *                 rol: "admin"
 *     responses:
 *       201:
 *         description: Usuario creado.
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
 *         description: Datos invalidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Rol insuficiente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authMiddleware, adminSupervisorOrSuperadminMiddleware, asyncHandler(controller.create.bind(controller)));

/**
 * @swagger
 * /api/usuarios-companias/{id}/inhabilitar:
 *   patch:
 *     tags: [Usuarios Companias]
 *     summary: Inhabilitar usuario-compania
 *     description: Marca el documento como inactivo y deshabilita al usuario en Firebase Auth.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Usuario inhabilitado.
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
 *       401:
 *         description: No autorizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Rol insuficiente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: No encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id/inhabilitar', authMiddleware, adminSupervisorOrSuperadminMiddleware, asyncHandler(controller.desactivar.bind(controller)));

/**
 * @swagger
 * /api/usuarios-companias/{id}/habilitar:
 *   patch:
 *     tags: [Usuarios Companias]
 *     summary: Habilitar usuario-compania
 *     description: Marca el documento como activo y habilita al usuario en Firebase Auth.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Usuario habilitado.
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
 *       401:
 *         description: No autorizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Rol insuficiente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: No encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id/habilitar', authMiddleware, adminSupervisorOrSuperadminMiddleware, asyncHandler(controller.activar.bind(controller)));

export default router;
