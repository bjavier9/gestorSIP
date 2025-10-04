import request from 'supertest';
import express, { Express } from 'express';
import container from '../../config/container';
import { TYPES } from '../../config/types';
import { AseguradoraService } from '../../application/aseguradora.service';
import { errorHandler } from '../../middleware/errorHandler';

jest.mock('../../middleware/authMiddleware', () => ({
    authMiddleware: jest.fn((req, res, next) => next()),
    superAdminMiddleware: jest.fn((req, res, next) => next()),
}));

const mockAseguradoraService = {
    getAllAseguradoras: jest.fn(),
    getAseguradoraById: jest.fn(),
    createAseguradora: jest.fn(),
    updateAseguradora: jest.fn(),
};

describe('Aseguradoras Routes', () => {
    let app: Express;

    beforeAll(() => {
        container.snapshot();
        container.rebind<AseguradoraService>(TYPES.AseguradoraService).toConstantValue(mockAseguradoraService as any);
        
        const aseguradorasRouter = require('../aseguradoras').default;

        app = express();
        app.use(express.json());
        app.use('/api/aseguradoras', aseguradorasRouter);
        app.use(errorHandler);
    });

    afterAll(() => {
        container.restore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/aseguradoras', () => {
        it('should return a list of aseguradoras', async () => {
            const aseguradoras = [{ id: '1', nombre: 'Aseguradora 1' }];
            mockAseguradoraService.getAllAseguradoras.mockResolvedValue(aseguradoras);

            const response = await request(app).get('/api/aseguradoras');

            expect(response.status).toBe(200);
            expect(response.body.data).toEqual(aseguradoras);
        });
    });

    describe('GET /api/aseguradoras/:id', () => {
        it('should return an aseguradora by id', async () => {
            const aseguradora = { id: '1', nombre: 'Aseguradora 1' };
            mockAseguradoraService.getAseguradoraById.mockResolvedValue(aseguradora);

            const response = await request(app).get('/api/aseguradoras/1');

            expect(response.status).toBe(200);
            expect(response.body.data).toEqual(aseguradora);
        });

        it('should return 404 if aseguradora not found', async () => {
            mockAseguradoraService.getAseguradoraById.mockResolvedValue(null);

            const response = await request(app).get('/api/aseguradoras/999');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/aseguradoras', () => {
        it('should create a new aseguradora', async () => {
            const newAseguradora = { nombre: 'Nueva Aseguradora' };
            const createdAseguradora = { id: '2', ...newAseguradora };
            mockAseguradoraService.createAseguradora.mockResolvedValue(createdAseguradora);

            const response = await request(app)
                .post('/api/aseguradoras')
                .send(newAseguradora);

            expect(response.status).toBe(201);
            expect(response.body.data).toEqual(createdAseguradora);
        });
    });

    describe('PUT /api/aseguradoras/:id', () => {
        it('should update an aseguradora', async () => {
            const updatedAseguradora = { id: '1', nombre: 'Aseguradora Actualizada' };
            mockAseguradoraService.updateAseguradora.mockResolvedValue(updatedAseguradora);

            const response = await request(app)
                .put('/api/aseguradoras/1')
                .send({ nombre: 'Aseguradora Actualizada' });

            expect(response.status).toBe(200);
            expect(response.body.data).toEqual(updatedAseguradora);
        });

        it('should return 404 if aseguradora to update is not found', async () => {
            mockAseguradoraService.updateAseguradora.mockResolvedValue(null);

            const response = await request(app)
                .put('/api/aseguradoras/999')
                .send({ nombre: 'Aseguradora Inexistente' });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });
});
