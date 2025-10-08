import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import {container} from '../di/container';
import { TYPES } from '../di/types';
import { UsuarioCompaniaService } from '../application/usuarioCompania.service';
import { UsuarioCompania } from '../domain/entities/usuarioCompania';
import { errorHandler } from '../middleware/errorHandler';

// Mock del middleware para simular un usuario con rol de 'admin'
jest.mock('../middleware/authMiddleware', () => ({
    authMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        req.body.user = {
            user: {
                role: 'admin',
                companiaCorretajeId: 'comp-1',
            } as any
        };
        next();
    }),
    adminSupervisorOrSuperadminMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
}));

const mockUsuarioCompaniaService: Partial<UsuarioCompaniaService> = {
    createUsuarioCompania: jest.fn(),
    setActive: jest.fn(),
};

describe('UsuarioCompania Routes', () => {
    let app: Express;

    beforeAll(() => {
        container.snapshot();
        container.rebind<UsuarioCompaniaService>(TYPES.UsuarioCompaniaService).toConstantValue(mockUsuarioCompaniaService as any);

        const usuariosCompaniasRoutes = require('../usuariosCompanias').default;

        app = express();
        app.use(express.json());
        app.use('/api/usuarios-companias', usuariosCompaniasRoutes);
        app.use(errorHandler);
    });

    afterAll(() => {
        container.restore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const testUsuarioCompania: UsuarioCompania = {
        id: 'user-123',
        userId: 'user-123', // Propiedad requerida añadida
        email: 'test@example.com',
        rol: 'agent',
        companiaCorretajeId: 'comp-1',
        activo: true,
        fechaCreacion: new Date(),
    };

    describe('POST /api/usuarios-companias', () => {
        it('should create a new user', async () => {
            const input = { 
                email: 'test@example.com', 
                password: 'password123', 
                companiaCorretajeId: 'comp-1', 
                rol: 'agent' 
            };
            (mockUsuarioCompaniaService.createUsuarioCompania as jest.Mock).mockResolvedValue(testUsuarioCompania);

            const response = await request(app)
                .post('/api/usuarios-companias')
                .send(input);

            expect(response.status).toBe(StatusCodes.CREATED);
            expect(response.body.body.data.id).toBe(testUsuarioCompania.id);
            expect(mockUsuarioCompaniaService.createUsuarioCompania).toHaveBeenCalledWith(input);
        });
    });

    describe('PATCH /api/usuarios-companias/:id/inhabilitar', () => {
        it('should deactivate a user', async () => {
            const deactivatedUser = { ...testUsuarioCompania, activo: false };
            (mockUsuarioCompaniaService.setActive as jest.Mock).mockResolvedValue(deactivatedUser);

            const response = await request(app).patch(`/api/usuarios-companias/${testUsuarioCompania.id}/inhabilitar`);

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.body.data.activo).toBe(false);
            expect(mockUsuarioCompaniaService.setActive).toHaveBeenCalledWith(testUsuarioCompania.id, false);
        });
    });

    describe('PATCH /api/usuarios-companias/:id/habilitar', () => {
        it('should activate a user', async () => {
            const activatedUser = { ...testUsuarioCompania, activo: true };
            (mockUsuarioCompaniaService.setActive as jest.Mock).mockResolvedValue(activatedUser);

            const response = await request(app).patch(`/api/usuarios-companias/${testUsuarioCompania.id}/habilitar`);

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.body.data.activo).toBe(true);
            expect(mockUsuarioCompaniaService.setActive).toHaveBeenCalledWith(testUsuarioCompania.id, true);
        });
    });
});
