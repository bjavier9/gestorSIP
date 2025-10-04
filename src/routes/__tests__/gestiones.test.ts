import request from 'supertest';
import express, { Express } from 'express';
import container from '../../config/container';
import { TYPES } from '../../config/types';
import { GestionService } from '../../application/gestion.service';
import { errorHandler } from '../../middleware/errorHandler';

const mockUser = {
  uid: 'test-user-id',
  companiaCorretajeId: 'test-compania-id',
  role: 'agent',
};

jest.mock('../../middleware/authMiddleware', () => ({
    authMiddleware: jest.fn((req, res, next) => {
        req.user = { user: mockUser };
        next();
    }),
    agentSupervisorMiddleware: jest.fn((req, res, next) => next()),
}));

const mockGestionService = {
    getGestionesByCompania: jest.fn(),
    getGestionById: jest.fn(),
    createGestion: jest.fn(),
    updateGestion: jest.fn(),
    deleteGestion: jest.fn(),
};

describe('Gestion Routes', () => {
    let app: Express;

    beforeAll(() => {
        container.snapshot();
        container.rebind<GestionService>(TYPES.GestionService).toConstantValue(mockGestionService as any);
        
        const gestionesRouter = require('../gestiones').default;

        app = express();
        app.use(express.json());
        app.use('/api/gestiones', gestionesRouter);
        app.use(errorHandler);
    });

    afterAll(() => {
        container.restore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/gestiones', () => {
        it('should return a list of gestiones', async () => {
            const gestiones = [{ id: '1', tipo: 'nueva' }];
            mockGestionService.getGestionesByCompania.mockResolvedValue(gestiones);

            const response = await request(app).get('/api/gestiones');

            expect(response.status).toBe(200);
            expect(response.body.body.data).toEqual(gestiones);
            expect(mockGestionService.getGestionesByCompania).toHaveBeenCalledWith(mockUser.companiaCorretajeId);
        });
    });

    describe('GET /api/gestiones/:id', () => {
        it('should return a gestion by id', async () => {
            const gestion = { id: '1', tipo: 'nueva', companiaCorretajeId: mockUser.companiaCorretajeId };
            mockGestionService.getGestionById.mockResolvedValue(gestion);

            const response = await request(app).get('/api/gestiones/1');

            expect(response.status).toBe(200);
            expect(response.body.body.data).toEqual(gestion);
            expect(mockGestionService.getGestionById).toHaveBeenCalledWith('1');
        });

        it('should return 404 if gestion not found', async () => {
            mockGestionService.getGestionById.mockResolvedValue(null);

            const response = await request(app).get('/api/gestiones/999');

            expect(response.status).toBe(404);
        });
    });

    describe('POST /api/gestiones', () => {
        it('should create a new gestion', async () => {
            const newGestionData = { tipo: 'nueva', leadId: 'lead1', agenteId: 'agent1' };
            const createdGestion = { id: '2', ...newGestionData, companiaCorretajeId: mockUser.companiaCorretajeId };
            mockGestionService.createGestion.mockResolvedValue(createdGestion);

            const response = await request(app)
                .post('/api/gestiones')
                .send(newGestionData);

            expect(response.status).toBe(201);
            expect(response.body.body.data).toEqual(createdGestion);
        });
    });

    describe('PUT /api/gestiones/:id', () => {
        it('should update a gestion', async () => {
            const existingGestion = { id: '1', tipo: 'nueva', companiaCorretajeId: mockUser.companiaCorretajeId, agenteId: mockUser.uid };
            const updatedData = { tipo: 'seguimiento' };
            const updatedGestion = { ...existingGestion, ...updatedData };

            mockGestionService.getGestionById.mockResolvedValue(existingGestion);
            mockGestionService.updateGestion.mockResolvedValue(updatedGestion);

            const response = await request(app)
                .put('/api/gestiones/1')
                .send(updatedData);

            expect(response.status).toBe(200);
            expect(response.body.body.data).toEqual(updatedGestion);
        });

        it('should return 404 if gestion to update is not found', async () => {
            mockGestionService.getGestionById.mockResolvedValue(null);

            const response = await request(app)
                .put('/api/gestiones/999')
                .send({ tipo: 'seguimiento' });

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/gestiones/:id', () => {
        it('should delete a gestion', async () => {
            const existingGestion = { id: '1', companiaCorretajeId: mockUser.companiaCorretajeId, agenteId: mockUser.uid };
            mockGestionService.getGestionById.mockResolvedValue(existingGestion);
            mockGestionService.deleteGestion.mockResolvedValue(true);

            const response = await request(app).delete('/api/gestiones/1');

            expect(response.status).toBe(200);
            expect(response.body.body.data).toEqual({ message: 'Gestion eliminada' });
        });

        it('should return 404 if gestion to delete is not found', async () => {
            mockGestionService.getGestionById.mockResolvedValue(null);

            const response = await request(app).delete('/api/gestiones/999');

            expect(response.status).toBe(404);
        });
    });
});
