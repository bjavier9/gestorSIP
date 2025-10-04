import request from 'supertest';
import express, { Express } from 'express';
import { StatusCodes } from 'http-status-codes';
import container from '../../config/container';
import { TYPES } from '../../config/types';
import { LeadService } from '../../application/lead.service';
import { Lead } from '../../domain/lead';
import { errorHandler } from '../../middleware/errorHandler';
import { ApiError } from '../../utils/ApiError';

// Mock COMPLETO del middleware, ahora con contexto de usuario
jest.mock('../../middleware/authMiddleware', () => ({
    authMiddleware: jest.fn((req, res, next) => {
        // Simula un usuario autenticado adjunto a la request
        req.user = { user: { companiaCorretajeId: 'comp-1' } };
        next();
    }),
    agentSupervisorMiddleware: jest.fn((req, res, next) => next()),
}));

const mockLeadService: Partial<LeadService> = {
    createLead: jest.fn(),
    getLeadsByCompania: jest.fn(),
    getLeadById: jest.fn(),
    updateLead: jest.fn(),
    deleteLead: jest.fn(),
};

describe('Lead Routes', () => {
    let app: Express;

    beforeAll(() => {
        container.snapshot();
        container.rebind<LeadService>(TYPES.LeadService).toConstantValue(mockLeadService as any);

        const leadRoutes = require('../leads').default;

        app = express();
        app.use(express.json());
        app.use('/api/leads', leadRoutes);
        app.use(errorHandler);
    });

    afterAll(() => {
        container.restore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const testLead: Lead = {
        id: 'lead-1',
        nombre: 'Juan Prospecto',
        correo: 'juan.prospecto@example.com',
        telefono: '123456789',
        companiaCorretajeId: 'comp-1', // Coincide con el mock de req.user
        agenteId: 'agent-1',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        estado: 'nuevo',
        origen: 'web',
    };

    // Objeto para POST, sin ID de compañía ya que se infiere del token
    const testLeadInput = {
        nombre: 'Juan Prospecto',
        correo: 'juan.prospecto@example.com',
        telefono: '123456789',
        estado: 'nuevo' as const,
        origen: 'web',
    };
    
    // Objeto esperado en el servicio (con el ID de compañía inyectado)
    const expectedServiceInput = {
        ...testLeadInput,
        companiaCorretajeId: 'comp-1'
    };


    describe('POST /api/leads', () => {
        it('should create a new lead and return it', async () => {
            (mockLeadService.createLead as jest.Mock).mockResolvedValue(testLead);

            const response = await request(app)
                .post('/api/leads')
                .send(testLeadInput); // Enviamos sin companiaId

            expect(response.status).toBe(StatusCodes.CREATED);
            expect(response.body.body.data.id).toBe(testLead.id);
            // Verificamos que el servicio es llamado con el input + companiaId del mock
            expect(mockLeadService.createLead).toHaveBeenCalledWith(expectedServiceInput);
        });
    });

    describe('GET /api/leads/compania/:companiaId', () => {
        it('should return a list of leads for a company', async () => {
            (mockLeadService.getLeadsByCompania as jest.Mock).mockResolvedValue([testLead]);

            const response = await request(app).get(`/api/leads/compania/${testLead.companiaCorretajeId}`);

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.body.data[0].id).toBe(testLead.id);
            expect(mockLeadService.getLeadsByCompania).toHaveBeenCalledWith(testLead.companiaCorretajeId);
        });
    });

    describe('GET /api/leads/:id', () => {
        it('should return a lead by id', async () => {
            // El mock debe devolver el lead correcto para que pase la verificación de permisos
            (mockLeadService.getLeadById as jest.Mock).mockResolvedValue(testLead);

            const response = await request(app).get(`/api/leads/${testLead.id}`);

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.body.data.id).toBe(testLead.id);
            expect(mockLeadService.getLeadById).toHaveBeenCalledWith(testLead.id);
        });

        it('should return 404 if lead not found', async () => {
            (mockLeadService.getLeadById as jest.Mock).mockRejectedValue(new ApiError('NOT_FOUND', 'Lead not found', StatusCodes.NOT_FOUND));

            const response = await request(app).get('/api/leads/999');

            expect(response.status).toBe(StatusCodes.NOT_FOUND);
            expect(response.body.status.success).toBe(false);
        });
    });

    describe('PUT /api/leads/:id', () => {
        it('should update a lead', async () => {
            const updates = { estado: 'contactado' as const };
            const updatedLead = { ...testLead, ...updates };
            // El controlador primero llama a getLeadById para verificar permisos
            (mockLeadService.getLeadById as jest.Mock).mockResolvedValue(testLead);
            (mockLeadService.updateLead as jest.Mock).mockResolvedValue(updatedLead);

            const response = await request(app)
                .put(`/api/leads/${testLead.id}`)
                .send(updates);

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.body.data.estado).toBe('contactado');
            expect(mockLeadService.updateLead).toHaveBeenCalledWith(testLead.id, updates);
        });

        it('should return 404 if lead to update is not found', async () => {
            const updates = { estado: 'perdido' as const };
            // Simula que el lead no se encuentra en la verificación inicial
            (mockLeadService.getLeadById as jest.Mock).mockRejectedValue(new ApiError('NOT_FOUND', 'Lead not found', StatusCodes.NOT_FOUND));

            const response = await request(app)
                .put('/api/leads/999')
                .send(updates);

            expect(response.status).toBe(StatusCodes.NOT_FOUND);
            expect(response.body.status.success).toBe(false);
        });
    });

    describe('DELETE /api/leads/:id', () => {
        it('should delete a lead and return success confirmation', async () => {
            // El controlador primero llama a getLeadById para verificar permisos
            (mockLeadService.getLeadById as jest.Mock).mockResolvedValue(testLead);
            (mockLeadService.deleteLead as jest.Mock).mockResolvedValue(undefined);

            const response = await request(app).delete(`/api/leads/${testLead.id}`);

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.body.data.message).toBe('Lead eliminado');
            expect(mockLeadService.deleteLead).toHaveBeenCalledWith(testLead.id);
        });

        it('should return 404 if lead to delete is not found', async () => {
            // Simula que el lead no se encuentra en la verificación inicial
            (mockLeadService.getLeadById as jest.Mock).mockRejectedValue(new ApiError('NOT_FOUND', 'Lead not found', StatusCodes.NOT_FOUND));

            const response = await request(app).delete('/api/leads/999');

            expect(response.status).toBe(StatusCodes.NOT_FOUND);
            expect(response.body.status.success).toBe(false);
        });
    });
});
