import request from 'supertest';
import express, { Express } from 'express';
import {container} from '../di/container'; 
import { TYPES } from '../di/types';
import { ConfigurationService } from '../application/configuration.service';
import { errorHandler } from '../middleware/errorHandler';


jest.mock('../middleware/authMiddleware', () => ({
    authMiddleware: jest.fn((req, res, next) => next()),
    superAdminMiddleware: jest.fn((req, res, next) => next()),
    adminSupervisorOrSuperadminMiddleware: jest.fn((req, res, next) => next()), 
}));


const mockConfigurationService = {
    getAllConfigurations: jest.fn(),
    getConfigurationById: jest.fn(),
    createConfiguration: jest.fn(),
    updateConfiguration: jest.fn(),
};

describe('Configurations Routes', () => {
    let app: Express;

    beforeAll(() => {
        container.snapshot();
        container.rebind<ConfigurationService>(TYPES.ConfigurationService).toConstantValue(mockConfigurationService as any);

        const configurationsRouter = require('../configurations').default;

        app = express();
        app.use(express.json());
        app.use('/api/configurations', configurationsRouter);
        app.use(errorHandler);
    });

    afterAll(() => {
        container.restore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/configurations', () => {
        it('should return a list of configurations', async () => {
            const configurations = [{ id: 'roles', data: ['admin', 'user'] }];
            mockConfigurationService.getAllConfigurations.mockResolvedValue(configurations);

            const response = await request(app).get('/api/configurations');

            expect(response.status).toBe(200);
            expect(response.body.body.data).toEqual(configurations);
            expect(mockConfigurationService.getAllConfigurations).toHaveBeenCalled();
        });
    });

    describe('GET /api/configurations/:id', () => {
        it('should return a configuration by id', async () => {
            const configuration = { id: 'roles', data: ['admin', 'user'] };
            mockConfigurationService.getConfigurationById.mockResolvedValue(configuration);

            const response = await request(app).get('/api/configurations/roles');

            expect(response.status).toBe(200);
            expect(response.body.body.data).toEqual(configuration);
            expect(mockConfigurationService.getConfigurationById).toHaveBeenCalledWith('roles');
        });

        it('should return 404 if configuration not found', async () => {
            mockConfigurationService.getConfigurationById.mockResolvedValue(null);

            const response = await request(app).get('/api/configurations/nonexistent');

            expect(response.status).toBe(404);
            expect(response.body.status.success).toBe(false);
            expect(mockConfigurationService.getConfigurationById).toHaveBeenCalledWith('nonexistent');
        });
    });

    describe('POST /api/configurations', () => {
        it('should create a new configuration', async () => {
            const newConfiguration = { id: 'features', data: { newFeature: true } };
            mockConfigurationService.createConfiguration.mockResolvedValue(newConfiguration);

            const response = await request(app)
                .post('/api/configurations')
                .send(newConfiguration);

            expect(response.status).toBe(201);
            expect(response.body.body.data).toEqual(newConfiguration);
            expect(mockConfigurationService.createConfiguration).toHaveBeenCalledWith(newConfiguration);
        });
    });

    describe('PUT /api/configurations/:id', () => {
        it('should update a configuration', async () => {
            const updatedConfiguration = { id: 'roles', data: ['admin', 'user', 'guest'] };
            mockConfigurationService.updateConfiguration.mockResolvedValue(updatedConfiguration);

            const response = await request(app)
                .put('/api/configurations/roles')
                .send({ data: ['admin', 'user', 'guest'] });

            expect(response.status).toBe(200);
            expect(response.body.body.data).toEqual(updatedConfiguration);
            expect(mockConfigurationService.updateConfiguration).toHaveBeenCalledWith('roles', { data: ['admin', 'user', 'guest'] });
        });

        it('should return 404 if configuration to update is not found', async () => {
            mockConfigurationService.updateConfiguration.mockResolvedValue(null);

            const response = await request(app)
                .put('/api/configurations/nonexistent')
                .send({ data: 'some data' });

            expect(response.status).toBe(404);
            expect(response.body.status.success).toBe(false);
            expect(mockConfigurationService.updateConfiguration).toHaveBeenCalledWith('nonexistent', { data: 'some data' });
        });
    });
});
