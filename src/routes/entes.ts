import { Router } from 'express';
import { container } from '../config/container';
import { EnteController } from '../infrastructure/http/ente.controller';
import { TYPES } from '../config/container';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const enteController = container.get<EnteController>(TYPES.EnteController);

// Proteger todas las rutas de entes con autenticación
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Entes
 *   description: Gestión de Entes (Clientes, Oficinas, etc.)
 */

/**
 * @swagger
 * /api/entes:
 *   get:
 *     summary: Obtener todos los entes
 *     tags: [Entes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de entes
 */
router.get('/', enteController.getAll.bind(enteController));

/**
 * @swagger
 * /api/entes/{id}:
 *   get:
 *     summary: Obtener un ente por ID
 *     tags: [Entes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalles del ente
 *       404:
 *         description: Ente no encontrado
 */
router.get('/:id', enteController.getById.bind(enteController));

/**
 * @swagger
 * /api/entes:
 *   post:
 *     summary: Crear un nuevo ente
 *     tags: [Entes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ente' # Referencia al esquema de Ente
 *     responses:
 *       21:
 *         description: Ente creado exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/', enteController.create.bind(enteController));

/**
 * @swagger
 * /api/entes/{id}:
 *   put:
 *     summary: Actualizar un ente existente
 *     tags: [Entes]
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
 *             $ref: '#/components/schemas/Ente' # Referencia al esquema de Ente
 *     responses:
 *       200:
 *         description: Ente actualizado
 *       404:
 *         description: Ente no encontrado
 */
router.put('/:id', enteController.update.bind(enteController));

/**
 * @swagger
 * /api/entes/{id}:
 *   delete:
 *     summary: Eliminar un ente
 *     tags: [Entes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Ente eliminado
 *       404:
 *         description: Ente no encontrado
 */
router.delete('/:id', enteController.delete.bind(enteController));

export default router;
