import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { generateTestToken } from '../../utils/__tests__/auth.helper';
import { UserRole } from '../../domain/roles';
import { ApiError } from '../../utils/ApiError';
import { TYPES } from '../../config/types';

// 1. Definimos nuestro controlador falso.
const mockOficinaController = {
  createOficina: jest.fn(),
};

// 2. Mockeamos el módulo del contenedor.
// Dado que el módulo original usa `export default container;`, nuestro mock debe
// devolver un objeto con una propiedad `default`.
jest.mock('../../config/container', () => ({
  __esModule: true, // Necesario para que Jest maneje correctamente el `export default`
  default: {
    get: jest.fn().mockImplementation((type: symbol) => {
      // El contenedor real usa Symbols (TYPES) para resolver las dependencias.
      if (type === TYPES.OficinaController) {
        return mockOficinaController;
      }
      return null;
    }),
  },
}));

// 3. Ahora que el mock está configurado correctamente, importamos las rutas.
import oficinaRoutes from '../oficinas';

// --- Configuración de la App de Express para el Test ---
const app = express();
app.use(express.json());
app.use('/api/companias/:companiaId/oficinas', oficinaRoutes);

// Manejador de errores global para el test
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ error: { message: err.message, code: err.errorKey } });
  } else {
    res.status(500).json({ error: { message: 'Internal Server Error' } });
  }
});

// --- Suite de Tests ---
describe('Oficina Routes Integration Test', () => {
  const companiaId = 'test-compania-id';
  const anotherCompaniaId = 'another-compania-id';
  const adminToken = generateTestToken({ uid: 'admin-test-user', role: UserRole.ADMIN, companiaCorretajeId: companiaId, email: 'admin@test.com' });
  const agentToken = generateTestToken({ uid: 'agent-test-user', role: UserRole.AGENT, companiaCorretajeId: companiaId, email: 'agent@test.com' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/companias/:companiaId/oficinas', () => {
    const newOficinaData = { nombre: 'Oficina Principal', direccion: 'Calle Falsa 123' };

    it('should pass authorization and call the controller method for an admin user', async () => {
        mockOficinaController.createOficina.mockImplementation(async (req, res) => {
            res.status(StatusCodes.CREATED).json({ message: 'Oficina creada' });
        });

        await request(app)
            .post(`/api/companias/${companiaId}/oficinas`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(newOficinaData);

        expect(mockOficinaController.createOficina).toHaveBeenCalledTimes(1);
    });

    it('should be stopped by auth middleware for a user with incorrect role', async () => {
        const response = await request(app)
            .post(`/api/companias/${companiaId}/oficinas`)
            .set('Authorization', `Bearer ${agentToken}`)
            .send(newOficinaData);

        expect(response.status).toBe(StatusCodes.FORBIDDEN);
        expect(mockOficinaController.createOficina).not.toHaveBeenCalled();
    });

    it('should be stopped by auth middleware if user tries to access another company', async () => {
        const response = await request(app)
            .post(`/api/companias/${anotherCompaniaId}/oficinas`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(newOficinaData);

        expect(response.status).toBe(StatusCodes.FORBIDDEN);
        expect(mockOficinaController.createOficina).not.toHaveBeenCalled();
    });

    it('should return a 400 Bad Request if the controller throws a validation ApiError', async () => {
        const validationError = new ApiError('VALIDATION_ERROR', 'El nombre es requerido', StatusCodes.BAD_REQUEST);

        mockOficinaController.createOficina.mockImplementation(async (req, res, next) => {
            next(validationError);
        });

        const response = await request(app)
            .post(`/api/companias/${companiaId}/oficinas`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ direccion: 'Una dirección sin nombre' });

        expect(mockOficinaController.createOficina).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        expect(response.body.error.code).toEqual('VALIDATION_ERROR');
    });
  });
});
