
import request from 'supertest';
import express from 'express';
import { ConfigurationController } from '../../infrastructure/http/configuration.controller';
import { ConfigurationService } from '../../application/configuration.service';
import { authMiddleware, superAdminMiddleware } from '../../middleware/authMiddleware';
import configurationsRouter from '../configurations';

jest.mock('../../application/configuration.service');
jest.mock('../../middleware/authMiddleware', () => ({
    authMiddleware: jest.fn((req, res, next) => next()),
    superAdminMiddleware: jest.fn((req, res, next) => next()),
}));

const app = express();
app.use(express.json());

const mockConfigurationService = {
    getAllConfigurations: jest.fn(),
    getConfigurationById: jest.fn(),
    createConfiguration: jest.fn(),
    updateConfiguration: jest.fn(),
};

const mockConfigurationController = new ConfigurationController(mockConfigurationService as any);

app.use('/api/configurations', configurationsRouter);

describe('Configurations Routes', () => {
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
        });
    });

    describe('GET /api/configurations/:id', () => {
        it('should return a configuration by id', async () => {
            const configuration = { id: 'roles', data: ['admin', 'user'] };
            mockConfigurationService.getConfigurationById.mockResolvedValue(configuration);

            const response = await request(app).get('/api/configurations/roles');

            expect(response.status).toBe(200);
            expect(response.body.body.data).toEqual(configuration);
        });

        it('should return 404 if configuration not found', async () => {
            mockConfigurationService.getConfigurationById.mockResolvedValue(null);

            const response = await request(app).get('/api/configurations/nonexistent');

            expect(response.status).toBe(404);
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
        });

        it('should return 404 if configuration to update is not found', async () => {
            mockConfigurationService.updateConfiguration.mockResolvedValue(null);

            const response = await request(app)
                .put('/api/configurations/nonexistent')
                .send({ data: 'some data' });

            expect(response.status).toBe(404);
        });
    });
});
