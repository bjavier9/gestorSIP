import request from 'supertest';
import express, { Express } from 'express';
import container from '../../config/container';
import { TYPES } from '../../config/types';
import { EnteService } from '../../application/ente.service';
import { errorHandler } from '../../middleware/errorHandler';

jest.mock('../../middleware/authMiddleware', () => ({
    authMiddleware: jest.fn((req, res, next) => next()),
}));

const mockEnteService = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

describe('Ente Routes', () => {
    let app: Express;

    beforeAll(() => {
        container.snapshot();
        container.rebind<EnteService>(TYPES.EnteService).toConstantValue(mockEnteService as any);
        
        const entesRouter = require('../entes').default;

        app = express();
        app.use(express.json());
        app.use('/api/entes', entesRouter);
        app.use(errorHandler);
    });

    afterAll(() => {
        container.restore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/entes', () => {
        it('should return a list of entes', async () => {
            const entes = [{ id: '1', nombre: 'Ente 1' }];
            mockEnteService.getAll.mockResolvedValue(entes);

            const response = await request(app).get('/api/entes');

            expect(response.status).toBe(200);
            expect(response.body.body.data).toEqual(entes);
            expect(mockEnteService.getAll).toHaveBeenCalled();
        });
    });

    describe('GET /api/entes/:id', () => {
        it('should return an ente by id', async () => {
            const ente = { id: '1', nombre: 'Ente 1' };
            mockEnteService.getById.mockResolvedValue(ente);

            const response = await request(app).get('/api/entes/1');

            expect(response.status).toBe(200);
            expect(response.body.body.data).toEqual(ente);
            expect(mockEnteService.getById).toHaveBeenCalledWith('1');
        });

        it('should return 404 if ente not found', async () => {
            mockEnteService.getById.mockResolvedValue(null);

            const response = await request(app).get('/api/entes/999');

            expect(response.status).toBe(404);
            expect(response.body.status.success).toBe(false);
        });
    });

    describe('POST /api/entes', () => {
        it('should create a new ente', async () => {
            const newEnte = { nombre: 'Nuevo Ente' };
            const createdEnte = { id: '2', ...newEnte };
            mockEnteService.create.mockResolvedValue(createdEnte);

            const response = await request(app)
                .post('/api/entes')
                .send(newEnte);

            expect(response.status).toBe(201);
            expect(response.body.body.data).toEqual(createdEnte);
            expect(mockEnteService.create).toHaveBeenCalledWith(newEnte);
        });
    });

    describe('PUT /api/entes/:id', () => {
        it('should update an ente', async () => {
            const updatedEnte = { id: '1', nombre: 'Ente Actualizado' };
            mockEnteService.update.mockResolvedValue(updatedEnte);

            const response = await request(app)
                .put('/api/entes/1')
                .send({ nombre: 'Ente Actualizado' });

            expect(response.status).toBe(200);
            expect(response.body.body.data).toEqual(updatedEnte);
        });

        it('should return 404 if ente to update is not found', async () => {
            mockEnteService.update.mockResolvedValue(null);

            const response = await request(app)
                .put('/api/entes/999')
                .send({ nombre: 'Ente Inexistente' });

            expect(response.status).toBe(404);
            expect(response.body.status.success).toBe(false);
        });
    });

    describe('DELETE /api/entes/:id', () => {
        it('should delete an ente', async () => {
            mockEnteService.delete.mockResolvedValue({ message: 'Ente deleted successfully' });

            const response = await request(app).delete('/api/entes/1');

            expect(response.status).toBe(200);
            expect(response.body.body.data.message).toBe('Ente deleted successfully');
        });

        it('should return 404 if ente to delete is not found', async () => {
            mockEnteService.delete.mockResolvedValue(null);

            const response = await request(app).delete('/api/entes/999');

            expect(response.status).toBe(404);
            expect(response.body.status.success).toBe(false);
        });
    });
});
