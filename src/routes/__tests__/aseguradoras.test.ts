
import request from 'supertest';
import express from 'express';
import { AseguradoraController } from '../../infrastructure/http/aseguradora.controller';
import { AseguradoraService } from '../../application/aseguradora.service';
import { authMiddleware, adminSupervisorOrSuperadminMiddleware } from '../../middleware/authMiddleware';
import aseguradorasRouter from '../aseguradoras';

jest.mock('../../application/aseguradora.service');
jest.mock('../../middleware/authMiddleware', () => ({
    authMiddleware: jest.fn((req, res, next) => next()),
    adminSupervisorOrSuperadminMiddleware: jest.fn((req, res, next) => next()),
}));

const app = express();
app.use(express.json());

const mockAseguradoraService = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
};

const mockAseguradoraController = new AseguradoraController(mockAseguradoraService as any);

app.use('/api/aseguradoras', aseguradorasRouter);

describe('Aseguradoras Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/aseguradoras', () => {
        it('should return a list of aseguradoras', async () => {
            const aseguradoras = [{ id: '1', nombre: 'Aseguradora 1' }];
            mockAseguradoraService.getAll.mockResolvedValue(aseguradoras);

            const response = await request(app).get('/api/aseguradoras');

            expect(response.status).toBe(200);
            expect(response.body.body.data).toEqual(aseguradoras);
        });
    });

    describe('GET /api/aseguradoras/:id', () => {
        it('should return an aseguradora by id', async () => {
            const aseguradora = { id: '1', nombre: 'Aseguradora 1' };
            mockAseguradoraService.getById.mockResolvedValue(aseguradora);

            const response = await request(app).get('/api/aseguradoras/1');

            expect(response.status).toBe(200);
            expect(response.body.body.data).toEqual(aseguradora);
        });

        it('should return 404 if aseguradora not found', async () => {
            mockAseguradoraService.getById.mockResolvedValue(null);

            const response = await request(app).get('/api/aseguradoras/999');

            expect(response.status).toBe(404);
        });
    });

    describe('POST /api/aseguradoras', () => {
        it('should create a new aseguradora', async () => {
            const newAseguradora = { nombre: 'Nueva Aseguradora' };
            const createdAseguradora = { id: '2', ...newAseguradora };
            mockAseguradoraService.create.mockResolvedValue(createdAseguradora);

            const response = await request(app)
                .post('/api/aseguradoras')
                .send(newAseguradora);

            expect(response.status).toBe(201);
            expect(response.body.body.data).toEqual(createdAseguradora);
        });
    });

    describe('PUT /api/aseguradoras/:id', () => {
        it('should update an aseguradora', async () => {
            const updatedAseguradora = { id: '1', nombre: 'Aseguradora Actualizada' };
            mockAseguradoraService.update.mockResolvedValue(updatedAseguradora);

            const response = await request(app)
                .put('/api/aseguradoras/1')
                .send({ nombre: 'Aseguradora Actualizada' });

            expect(response.status).toBe(200);
            expect(response.body.body.data).toEqual(updatedAseguradora);
        });

        it('should return 404 if aseguradora to update is not found', async () => {
            mockAseguradoraService.update.mockResolvedValue(null);

            const response = await request(app)
                .put('/api/aseguradoras/999')
                .send({ nombre: 'Aseguradora Inexistente' });

            expect(response.status).toBe(404);
        });
    });
});

