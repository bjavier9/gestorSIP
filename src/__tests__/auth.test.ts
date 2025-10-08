/**
 * @fileoverview Integration test for authentication routes.
 * 
 * @description
 * This test file follows the principles of robust integration testing:
 * 1. Set up test-specific environment variables BEFORE any application code is imported.
 *    This is crucial to prevent modules from caching incorrect configurations.
 * 2. Mock external dependencies at the module level (e.g., `firebase-admin` SDK) to ensure
 *    the test is isolated and doesn't make real network calls.
 * 3. Use an isolated Inversify container for dependency injection to replace production
 *    implementations (like database adapters) with in-memory test doubles.
 * 4. Build the Express app and its routes within the test setup, using controllers and
 *    services resolved from the isolated container.
 */

// 1. Set environment variables BEFORE any other imports
const JWT_SECRET = 'test-secret-key';
process.env.JWT_SECRET = JWT_SECRET;

import request from 'supertest';
import express, { Express, Router, Request, Response, NextFunction } from 'express';
import { Container } from 'inversify';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { TYPES } from '../di/types';
import { ApiError } from '../utils/ApiError';

// Application components
import { AuthController } from '../infrastructure/http/auth.controller';
import { AuthService, AuthPayload } from '../application/auth.service';
import { UsuarioCompania } from '../domain/entities/usuarioCompania';
import { UsuarioCompaniaRepository } from '../domain/ports/usuarioCompaniaRepository.port';
import { CompaniaCorretaje } from '../domain/entities/companiaCorretaje';
import { CompaniaCorretajeRepository } from '../domain/ports/companiaCorretajeRepository.port';
import { UserRole } from '../domain/entities/roles';

// 2. Mock external, module-level dependencies
const mockVerifyIdToken = jest.fn();
jest.mock('firebase-admin/auth', () => ({
    getAuth: () => ({
        verifyIdToken: mockVerifyIdToken,
    }),
}));

// 3. Define in-memory test doubles
class InMemoryUsuarioCompaniaRepository implements UsuarioCompaniaRepository {
    public usuarios: UsuarioCompania[] = [];
    async findByUserId(userId: string): Promise<UsuarioCompania[]> { return this.usuarios.filter(u => u.userId === userId && u.activo); }
    async findByUserAndCompania(userId: string, companiaId: string): Promise<UsuarioCompania | null> { return this.usuarios.find(u => u.userId === userId && u.companiaCorretajeId === companiaId) || null; }
    async create(data: Omit<UsuarioCompania, 'id' | 'activo' | 'fechaCreacion'>): Promise<UsuarioCompania> {
        const newUserCompania: UsuarioCompania = { id: `uc-${this.usuarios.length + 1}`, activo: true, fechaCreacion: new Date(), ...data };
        this.usuarios.push(newUserCompania);
        return newUserCompania;
    }
    async setActive(id: string, active: boolean): Promise<UsuarioCompania> {
        const user = this.usuarios.find(u => u.id === id);
        if (!user) throw new Error('User not found');
        user.activo = active;
        return user;
    }
    async findAll(): Promise<UsuarioCompania[]> { return this.usuarios; }
    async findById(id: string): Promise<UsuarioCompania | null> { return this.usuarios.find(u => u.id === id) || null; }
    async update(id: string, data: Partial<UsuarioCompania>): Promise<UsuarioCompania> {
        const user = this.usuarios.find(u => u.id === id);
        if (!user) throw new Error('User not found');
        Object.assign(user, data);
        return user;
    }
    async delete(id: string): Promise<boolean> { 
        const index = this.usuarios.findIndex(u => u.id === id);
        if (index > -1) { this.usuarios.splice(index, 1); return true; }
        return false; 
    }
    public clear(): void { this.usuarios = []; }
    public seed(data: UsuarioCompania[]): void { this.usuarios = [...data]; }
}

class InMemoryCompaniaCorretajeRepository implements CompaniaCorretajeRepository {
    public companias: CompaniaCorretaje[] = [];
    async findFirst(): Promise<CompaniaCorretaje | null> { return this.companias[0] || null; }
    async findByRif(rif: string): Promise<CompaniaCorretaje | null> { return null; }
    async setActive(id: string, active: boolean): Promise<CompaniaCorretaje> { throw new Error('Method not implemented.'); }
    async create(data: Omit<CompaniaCorretaje, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<CompaniaCorretaje> { throw new Error('Method not implemented.'); }
    async findAll(): Promise<CompaniaCorretaje[]> { return this.companias; }
    async findById(id: string): Promise<CompaniaCorretaje | null> { return null; }
    async update(id: string, data: Partial<CompaniaCorretaje>): Promise<CompaniaCorretaje> { throw new Error('Method not implemented.'); }
    async delete(id: string): Promise<boolean> { return false; }
}

// 4. Test Suite Setup
describe('Auth Routes Integration Test', () => {
    let app: Express;
    let userRepo: InMemoryUsuarioCompaniaRepository;

    beforeAll(() => {
        const container = new Container();

        // Bind application components
        container.bind<AuthService>(TYPES.AuthService).to(AuthService);
        container.bind<AuthController>(TYPES.AuthController).to(AuthController);

        // Create a single instance of the in-memory repo
        userRepo = new InMemoryUsuarioCompaniaRepository();

        // Bind the repository interfaces to our in-memory implementations
        container.bind<UsuarioCompaniaRepository>(TYPES.UsuarioCompaniaRepository).toConstantValue(userRepo);
        container.bind<CompaniaCorretajeRepository>(TYPES.CompaniaCorretajeRepository).to(InMemoryCompaniaCorretajeRepository);

        // Resolve the controller from our isolated container
        const testAuthController = container.get<AuthController>(TYPES.AuthController);
        
        // Build a new router using the resolved controller
        const testRouter = Router();
        testRouter.post('/login', asyncHandler(testAuthController.login.bind(testAuthController)));

        // Build the test Express app
        app = express();
        app.use(express.json());
        app.use('/api/auth', testRouter);

        // Add a final error handler
        app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            if (err instanceof ApiError) {
                res.status(err.statusCode).json({ error: { message: err.message, code: err.errorKey } });
            } else {
                console.error(err);
                res.status(500).json({ error: { message: 'Internal Server Error' } });
            }
        });
    });

    beforeEach(() => {
        // Reset mocks and data before each test
        mockVerifyIdToken.mockClear();
        userRepo.clear();
    });

    describe('POST /api/auth/login', () => {

        const createMockUserCompania = (data: Partial<UsuarioCompania>): UsuarioCompania => ({
            id: `uc-${Math.random()}`,
            userId: 'test-user',
            email: 'test@test.com',
            companiaCorretajeId: 'test-cia',
            rol: UserRole.AGENT,
            activo: true,
            fechaCreacion: new Date(),
            ...data,
        });

        it('should return a token with needsSelection: false for a user in one company', async () => {
            const userId = 'user-in-one-company';
            const userEmail = 'single@test.com';
            const companiaId = 'cia-1';

            userRepo.seed([createMockUserCompania({ userId, email: userEmail, companiaCorretajeId: companiaId, rol: UserRole.AGENT })]);
            mockVerifyIdToken.mockResolvedValue({ uid: userId, email: userEmail });

            const response = await request(app)
                .post('/api/auth/login')
                .send({ idToken: 'fake-firebase-token' });

            expect(response.status).toBe(200);
            expect(response.body.body.data.needsSelection).toBe(false);
            const decoded = jwt.verify(response.body.body.data.token, JWT_SECRET) as { user: AuthPayload };
            expect(decoded.user.companiaCorretajeId).toBe(companiaId);
        });

        it('should return a token with needsSelection: true for a user in multiple companies', async () => {
             const userId = 'user-in-multiple-companies';
             const userEmail = 'multiple@test.com';
 
             userRepo.seed([
                createMockUserCompania({ userId, email: userEmail, companiaCorretajeId: 'cia-1', rol: UserRole.ADMIN }),
                createMockUserCompania({ userId, email: userEmail, companiaCorretajeId: 'cia-2', rol: UserRole.AGENT }),
             ]);
 
             mockVerifyIdToken.mockResolvedValue({ uid: userId, email: userEmail });
 
             const response = await request(app)
                 .post('/api/auth/login')
                 .send({ idToken: 'fake-firebase-token' });
 
             expect(response.status).toBe(200);
             expect(response.body.body.data.needsSelection).toBe(true);
             const decoded = jwt.verify(response.body.body.data.token, JWT_SECRET) as { user: AuthPayload };
             expect(decoded.user.pendienteCia).toBe(true);
        });

        it('should return 401 Unauthorized for an invalid Firebase token', async () => {
            mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));

            const response = await request(app)
                .post('/api/auth/login')
                .send({ idToken: 'invalid-firebase-token' });

            expect(response.status).toBe(401);
            expect(response.body.error.code).toBe('AUTH_INVALID_FIREBASE_TOKEN');
        });

        it('should return 403 Forbidden for a user not assigned to any company', async () => {
            const userId = 'user-with-no-company';
            const userEmail = 'no-company@test.com';
            
            mockVerifyIdToken.mockResolvedValue({ uid: userId, email: userEmail });

            const response = await request(app)
                .post('/api/auth/login')
                .send({ idToken: 'fake-firebase-token' });

            expect(response.status).toBe(403);
            expect(response.body.error.code).toBe('AUTH_NO_COMPANIES_ASSIGNED');
        });
    });
});
