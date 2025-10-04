import request from 'supertest';
import express, { Express, Router, Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import container from '../../config/container';
import { TYPES } from '../../config/types';
import { OficinaService } from '../../application/oficina.service';
import { Oficina } from '../../domain/oficina';
import { errorHandler } from '../../middleware/errorHandler';

// Mock corregido para evitar el error de TypeScript Property 'user' does not exist on type 'Request'
jest.mock('../../middleware/authMiddleware', () => ({
    authMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        // Se realiza una aserción de tipo en `req` para permitir la asignación de la propiedad `user`
        (req as any).user = {
            user: {
                role: 'admin',
                companiaCorretajeId: 'comp-1',
            }
        };
        next();
    }),
    authorizeCompaniaAccess: jest.fn(() => (req: Request, res: Response, next: NextFunction) => next()),
}));

const mockOficinaService: Partial<OficinaService> = {
    createOficina: jest.fn(),
    getOficinas: jest.fn(),
    getOficinaById: jest.fn(),
    updateOficina: jest.fn(),
    deleteOficina: jest.fn(),
};

describe('Oficina Routes', () => {
    let app: Express;
    const companiaId = 'comp-1';

    beforeAll(() => {
        container.snapshot();
        container.rebind<OficinaService>(TYPES.OficinaService).toConstantValue(mockOficinaService as any);

        const oficinaRoutes = require('../oficinas').default;

        app = express();
        app.use(express.json());
        
        const companiaRouter = Router();
        companiaRouter.use('/:companiaId/oficinas', oficinaRoutes);
        app.use('/api/companias', companiaRouter);
        
        app.use(errorHandler);
    });

    afterAll(() => {
        container.restore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const testOficina: Oficina = {
        id: 'oficina-1',
        nombre: 'Oficina Principal',
        direccion: 'Av. Principal 123',
        telefono: '555-5678',
        companiaCorretajeId: companiaId,
        moneda: 'USD',
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
    };

    describe(`POST /api/companias/${companiaId}/oficinas`, () => {
        it('should create a new office', async () => {
            const input = { nombre: testOficina.nombre, direccion: testOficina.direccion, moneda: 'USD', activo: true };
            const serviceInput = { ...input, companiaCorretajeId: companiaId };
            (mockOficinaService.createOficina as jest.Mock).mockResolvedValue(testOficina);

            const response = await request(app)
                .post(`/api/companias/${companiaId}/oficinas`)
                .send(input);

            expect(response.status).toBe(StatusCodes.CREATED);
            expect(response.body.body.data.id).toBe(testOficina.id);
            expect(mockOficinaService.createOficina).toHaveBeenCalledWith(expect.objectContaining(serviceInput));
        });
    });

    describe(`GET /api/companias/${companiaId}/oficinas`, () => {
        it('should return a list of offices', async () => {
            (mockOficinaService.getOficinas as jest.Mock).mockResolvedValue([testOficina]);

            const response = await request(app).get(`/api/companias/${companiaId}/oficinas`);

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.body.data[0].id).toBe(testOficina.id);
            expect(mockOficinaService.getOficinas).toHaveBeenCalledWith(companiaId);
        });
    });

    describe(`GET /api/companias/${companiaId}/oficinas/:oficinaId`, () => {
        it('should return an office by id', async () => {
            (mockOficinaService.getOficinaById as jest.Mock).mockResolvedValue(testOficina);

            const response = await request(app).get(`/api/companias/${companiaId}/oficinas/${testOficina.id}`);

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.body.data.id).toBe(testOficina.id);
            expect(mockOficinaService.getOficinaById).toHaveBeenCalledWith(companiaId, testOficina.id);
        });
    });

    describe(`PUT /api/companias/${companiaId}/oficinas/:oficinaId`, () => {
        it('should update an office', async () => {
            const updates = { nombre: 'Oficina Actualizada' };
            const updatedOficina = { ...testOficina, ...updates };
            (mockOficinaService.updateOficina as jest.Mock).mockResolvedValue(updatedOficina);

            const response = await request(app)
                .put(`/api/companias/${companiaId}/oficinas/${testOficina.id}`)
                .send(updates);

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.body.data.nombre).toBe('Oficina Actualizada');
            expect(mockOficinaService.updateOficina).toHaveBeenCalledWith(companiaId, testOficina.id, updates);
        });
    });

    describe(`DELETE /api/companias/${companiaId}/oficinas/:oficinaId`, () => {
        it('should delete an office', async () => {
            (mockOficinaService.deleteOficina as jest.Mock).mockResolvedValue(undefined);

            const response = await request(app).delete(`/api/companias/${companiaId}/oficinas/${testOficina.id}`);

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.body.data.message).toBeDefined();
            expect(mockOficinaService.deleteOficina).toHaveBeenCalledWith(companiaId, testOficina.id);
        });
    });
});
