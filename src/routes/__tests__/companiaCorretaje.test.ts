import request from 'supertest';
import express, { Express } from 'express';
import { StatusCodes } from 'http-status-codes';
import container from '../../config/container';
import { TYPES } from '../../config/types';
import { CompaniaCorretajeService } from '../../application/companiaCorretaje.service';
import { CompaniaCorretaje, Creada, Modificado } from '../../domain/companiaCorretaje';
import { errorHandler } from '../../middleware/errorHandler';

// Mock del middleware de autenticación para simular un Super Admin
jest.mock('../../middleware/authMiddleware', () => ({
    authMiddleware: jest.fn((req, res, next) => {
        req.user = {
            user: {
                role: 'superadmin',
                email: process.env.SUPERADMIN_EMAIL || 'superadmin@test.com'
            }
        };
        next();
    }),
    superAdminMiddleware: jest.fn((req, res, next) => next()),
}));

const mockCompaniaService: Partial<CompaniaCorretajeService> = {
    createCompania: jest.fn(),
    updateCompania: jest.fn(),
    activarCompania: jest.fn(),
    desactivarCompania: jest.fn(),
};

describe('CompaniaCorretaje Routes', () => {
    let app: Express;

    beforeAll(() => {
        process.env.SUPERADMIN_EMAIL = 'superadmin@test.com';

        container.snapshot();
        container.rebind<CompaniaCorretajeService>(TYPES.CompaniaCorretajeService).toConstantValue(mockCompaniaService as any);

        const companiaRoutes = require('../companiaCorretaje').default;

        app = express();
        app.use(express.json());
        app.use('/api/companias', companiaRoutes);
        app.use(errorHandler);
    });

    afterAll(() => {
        container.restore();
        delete process.env.SUPERADMIN_EMAIL;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Objeto de prueba corregido para coincidir con la interfaz del dominio
    const testCompania: CompaniaCorretaje = {
        id: 'comp-1',
        nombre: 'Compania Test',
        rif: 'J-123456789',
        direccion: 'Calle Falsa 123',
        telefono: '555-1234',
        correo: 'test@compania.com',
        activo: true, // Corregido de 'estado' a 'activo' (boolean)
        monedasAceptadas: ['USD', 'EUR'],
        monedaPorDefecto: 'USD',
        modulos: ['polizas'],
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        creada: { idente: 1 },
        modificado: []
    };

    describe('POST /api/companias', () => {
        it('should create a new company and return it', async () => {
            const input = { nombre: testCompania.nombre, rif: testCompania.rif };
            (mockCompaniaService.createCompania as jest.Mock).mockResolvedValue(testCompania);

            const response = await request(app)
                .post('/api/companias')
                .send(input);

            expect(response.status).toBe(StatusCodes.CREATED);
            expect(response.body.body.data.id).toBe(testCompania.id);
            expect(mockCompaniaService.createCompania).toHaveBeenCalledWith(input);
        });
    });

    describe('PUT /api/companias/:id', () => {
        it('should update a company', async () => {
            const updates = { nombre: 'Nuevo Nombre Test' };
            const updatedCompania = { ...testCompania, ...updates };
            (mockCompaniaService.updateCompania as jest.Mock).mockResolvedValue(updatedCompania);

            const response = await request(app)
                .put(`/api/companias/${testCompania.id}`)
                .send(updates);

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.body.data.nombre).toBe('Nuevo Nombre Test');
            expect(mockCompaniaService.updateCompania).toHaveBeenCalledWith(testCompania.id, updates);
        });
    });

    describe('PATCH /api/companias/:id/activar', () => {
        it('should activate a company', async () => {
            const activatedCompania = { ...testCompania, activo: true };
            (mockCompaniaService.activarCompania as jest.Mock).mockResolvedValue(activatedCompania);

            const response = await request(app).patch(`/api/companias/${testCompania.id}/activar`);

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.body.data.activo).toBe(true);
            expect(mockCompaniaService.activarCompania).toHaveBeenCalledWith(testCompania.id);
        });
    });

    describe('PATCH /api/companias/:id/desactivar', () => {
        it('should deactivate a company', async () => {
            const deactivatedCompania = { ...testCompania, activo: false };
            (mockCompaniaService.desactivarCompania as jest.Mock).mockResolvedValue(deactivatedCompania);

            const response = await request(app).patch(`/api/companias/${testCompania.id}/desactivar`);

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.body.data.activo).toBe(false);
            expect(mockCompaniaService.desactivarCompania).toHaveBeenCalledWith(testCompania.id);
        });
    });
});
