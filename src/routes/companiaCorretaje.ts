import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { CompaniaCorretajeController } from '../infrastructure/http/companiaCorretaje.controller';
import { authMiddleware, superAdminMiddleware } from '../middleware/authMiddleware';
import container from '../config/container';
import { TYPES } from '../config/types';

const companiaController = container.get<CompaniaCorretajeController>(TYPES.CompaniaCorretajeController);

const router = Router();

/**
 * @swagger
 * /api/companias:
 *   post:
 *     tags: [CompaÃ±Ã­as de Corretaje]
 *     summary: Create a new Brokerage Company
 *     description: Creates a new brokerage company. This endpoint is restricted to the configured Super Admin (token issued for SUPERADMIN_EMAIL).
 *     security:
 *       - bearerAuth: []
 *     x-security-details:
 *       requiredRole: superadmin
 *       requiredEmailEnv: SUPERADMIN_EMAIL
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf: [
 *               { $ref: '#/components/schemas/CreateCompaniaRequest' }
 *             ]
 *           examples:
 *             default:
 *               summary: Example payload
 *               value:
 *                 nombre: 'Compañía Demo'
 *                 rif: 'J-123456789'
 *                 direccion: 'Av. Siempre Viva 742'
 *                 telefono: '+58-212-5551234'
 *                 correo: 'demo@example.com'
 *                 monedasAceptadas: ['USD','EUR']
 *                 monedaPorDefecto: 'USD'
 *                 modulos: ['gestion_poliza','reporteria']
 *     responses:
 *       201:
 *         description: Company created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: 'object'
 *               properties:
 *                 success: { type: 'boolean', example: true }
 *                 status: { type: 'integer', example: 201 }
 *                 data:
 *                   $ref: '#/components/schemas/CompaniaCorretaje'
 *       400:
 *         description: Missing required fields.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       409:
 *         description: A company with this RIF already exists.
 *       500:
 *         description: Server misconfiguration (SUPERADMIN_EMAIL missing).
 */
router.post('/', authMiddleware, superAdminMiddleware, asyncHandler(companiaController.create.bind(companiaController)));


/**
 * @swagger
 * /api/companias/{id}:
 *   put:
 *     tags: [Compañías de Corretaje]
 *     summary: Update a Brokerage Company
 *     description: Updates fields of a brokerage company. Restricted to the configured Super Admin.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCompaniaRequest'
 *           examples:
 *             parcial:
 *               summary: Update phone and address
 *               value:
 *                 telefono: '+58-212-5550000'
 *                 direccion: 'Avenida Principal, Torre A'
 *     responses:
 *       200:
 *         description: Company updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 status: { type: integer, example: 200 }
 *                 data:
 *                   $ref: '#/components/schemas/CompaniaCorretaje'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Company not found.
 *       409:
 *         description: A company with this RIF already exists.
 */
router.put(
  '/:id',
  authMiddleware,
  superAdminMiddleware,
  asyncHandler(companiaController.update.bind(companiaController))
);

/**
 * @swagger
 * /api/companias/{id}/activar:
 *   patch:
 *     tags: [Compañías de Corretaje]
 *     summary: Activate a Brokerage Company
 *     description: Sets the company status to active. Restricted to the configured Super Admin.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Company activated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 status: { type: integer, example: 200 }
 *                 data:
 *                   $ref: '#/components/schemas/CompaniaCorretaje'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Company not found.
 */
router.patch(
  '/:id/activar',
  authMiddleware,
  superAdminMiddleware,
  asyncHandler(companiaController.activar.bind(companiaController))
);

/**
 * @swagger
 * /api/companias/{id}/desactivar:
 *   patch:
 *     tags: [Compañías de Corretaje]
 *     summary: Deactivate a Brokerage Company
 *     description: Sets the company status to inactive. Restricted to the configured Super Admin.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Company deactivated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 status: { type: integer, example: 200 }
 *                 data:
 *                   $ref: '#/components/schemas/CompaniaCorretaje'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Company not found.
 */
router.patch(
  '/:id/desactivar',
  authMiddleware,
  superAdminMiddleware,
  asyncHandler(companiaController.desactivar.bind(companiaController))
);

export default router;
