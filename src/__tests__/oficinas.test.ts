import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { generateTestToken } from '../../utils/__tests__/auth.helper';
import { UserRole } from '../../domain/roles';
import { ApiError } from '../../utils/ApiError';
import { TYPES } from '../../config/types';
import { Oficina } from '../../domain/oficina';
import { OficinaRepository } from '../../domain/ports/oficinaRepository.port';
import { OficinaService } from '../../application/oficina.service';
import { OficinaController } from '../../infrastructure/http/oficina.controller';

// Ensure JWT secret exists so the auth helper can sign tokens during tests.
const originalJwtSecret = process.env.JWT_SECRET;

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret';
}

// Simple in-memory adapter to emulate Firebase behavior during the tests.
class InMemoryOficinaRepository implements OficinaRepository {
  private store = new Map<string, Map<string, Oficina>>();
  private idCounter = 1;

  reset(): void {
    this.store.clear();
    this.idCounter = 1;
  }

  private ensureCompanyStore(companiaId: string): Map<string, Oficina> {
    if (!this.store.has(companiaId)) {
      this.store.set(companiaId, new Map());
    }
    return this.store.get(companiaId)!;
  }

  private clone(oficina: Oficina): Oficina {
    return {
      ...oficina,
      fechaCreacion: new Date(oficina.fechaCreacion),
      fechaActualizacion: new Date(oficina.fechaActualizacion),
    };
  }

  async create(data: Omit<Oficina, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<Oficina> {
    if (!data.companiaCorretajeId) {
      throw new ApiError('BAD_REQUEST', 'El ID de la compania es obligatorio.', StatusCodes.BAD_REQUEST);
    }

    const id = `oficina-${this.idCounter++}`;
    const now = new Date();
    const oficina: Oficina = {
      id,
      companiaCorretajeId: data.companiaCorretajeId,
      nombre: data.nombre,
      direccion: data.direccion ?? '',
      telefono: data.telefono ?? '',
      moneda: data.moneda ?? '',
      activo: data.activo ?? true,
      fechaCreacion: now,
      fechaActualizacion: now,
    };

    this.ensureCompanyStore(data.companiaCorretajeId).set(id, oficina);
    return this.clone(oficina);
  }

  async findAll(companiaId: string): Promise<Oficina[]> {
    const store = this.store.get(companiaId);
    if (!store) {
      return [];
    }
    return Array.from(store.values()).map((oficina) => this.clone(oficina));
  }

  async findById(companiaId: string, oficinaId: string): Promise<Oficina | null> {
    const store = this.store.get(companiaId);
    const oficina = store?.get(oficinaId);
    return oficina ? this.clone(oficina) : null;
  }

  async update(id: string, updates: Partial<Oficina>): Promise<Oficina | null> {
    const companiaId = updates.companiaCorretajeId;
    if (!companiaId) {
      throw new ApiError('BAD_REQUEST', 'El ID de la compania es obligatorio para actualizar.', StatusCodes.BAD_REQUEST);
    }
    const store = this.store.get(companiaId);
    const existing = store?.get(id);
    if (!existing) {
      return null;
    }

    const updated: Oficina = {
      ...existing,
      ...updates,
      fechaActualizacion: new Date(),
    };

    store!.set(id, updated);
    return this.clone(updated);
  }

  async delete(companiaId: string, oficinaId: string): Promise<boolean> {
    const store = this.store.get(companiaId);
    if (!store) {
      return false;
    }
    const existed = store.delete(oficinaId);
    if (store.size === 0) {
      this.store.delete(companiaId);
    }
    return existed;
  }
}

const inMemoryRepository = new InMemoryOficinaRepository();
const oficinaService = new OficinaService(inMemoryRepository);
const oficinaController = new OficinaController(oficinaService);

const containerMock = {
  get: jest.fn((type: symbol) => {
    if (type === TYPES.OficinaController) {
      return oficinaController;
    }
    throw new Error(`Unexpected dependency lookup: ${type.toString()}`);
  }),
};

describe('Oficina Routes Integration Test', () => {
  let app: express.Express;

  beforeAll(() => {
    jest.doMock('../../config/container', () => ({
      __esModule: true,
      default: containerMock,
    }));

    const oficinaRoutes = require('../oficinas').default;

    app = express();
    app.use(express.json());
    app.use('/api/companias/:companiaId/oficinas', oficinaRoutes);

    // Manejador de errores global para el test
    app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
      if (err instanceof ApiError) {
        return res.status(err.statusCode).json({ error: { message: err.message, code: err.errorKey } });
      }

      const anyError = err as { statusCode?: number; errorKey?: string; message?: string } | undefined;
      if (anyError && typeof anyError.statusCode === 'number' && typeof anyError.errorKey === 'string') {
        const message = typeof anyError.message === 'string' ? anyError.message : 'Error en la solicitud.';
        return res.status(anyError.statusCode).json({ error: { message, code: anyError.errorKey } });
      }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: { message: 'Internal Server Error' } });
    });
  });

  const companiaId = 'test-compania-id';
  const anotherCompaniaId = 'another-compania-id';
  const adminToken = generateTestToken({ uid: 'admin-test-user', role: UserRole.ADMIN, companiaCorretajeId: companiaId, email: 'admin@test.com' });
  const agentToken = generateTestToken({ uid: 'agent-test-user', role: UserRole.AGENT, companiaCorretajeId: companiaId, email: 'agent@test.com' });

  const baseOficinaPayload = {
    nombre: 'Oficina Principal',
    direccion: 'Calle Falsa 123',
    telefono: '+56912345678',
    moneda: 'CLP',
    activo: true,
  };

  const createOficina = async (payloadOverrides: Partial<typeof baseOficinaPayload> = {}) => {
    const response = await request(app)
      .post(`/api/companias/${companiaId}/oficinas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...baseOficinaPayload, ...payloadOverrides });

    expect(response.status).toBe(StatusCodes.CREATED);
    return response.body.body.data;
  };

  beforeEach(() => {
    containerMock.get.mockClear();
    inMemoryRepository.reset();
  });

  afterAll(() => {
    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
  });

  it('should create an oficina and persist it', async () => {
    const response = await request(app)
      .post(`/api/companias/${companiaId}/oficinas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(baseOficinaPayload);

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body.body.message).toBe('Oficina creada exitosamente.');
    expect(response.body.body.data).toEqual(expect.objectContaining({
      id: expect.any(String),
      companiaCorretajeId: companiaId,
      nombre: baseOficinaPayload.nombre,
      direccion: baseOficinaPayload.direccion,
      telefono: baseOficinaPayload.telefono,
      moneda: baseOficinaPayload.moneda,
      activo: baseOficinaPayload.activo,
    }));

    const stored = await inMemoryRepository.findById(companiaId, response.body.body.data.id);
    expect(stored).not.toBeNull();
    expect(stored).toEqual(expect.objectContaining({ nombre: baseOficinaPayload.nombre }));
  });

  it('should list all oficinas for the company', async () => {
    await createOficina({ nombre: 'Oficina Norte' });
    await createOficina({ nombre: 'Oficina Sur' });

    const response = await request(app)
      .get(`/api/companias/${companiaId}/oficinas`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(StatusCodes.OK);
    expect(Array.isArray(response.body.body.data)).toBe(true);
    expect(response.body.body.data).toHaveLength(2);
    const officeNames = response.body.body.data.map((office: any) => office.nombre).sort();
    expect(officeNames).toEqual(['Oficina Norte', 'Oficina Sur']);
  });

  it('should retrieve an oficina by id', async () => {
    const created = await createOficina({ nombre: 'Oficina Centro' });

    const response = await request(app)
      .get(`/api/companias/${companiaId}/oficinas/${created.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.body.data).toEqual(expect.objectContaining({
      id: created.id,
      nombre: 'Oficina Centro',
    }));
  });

  it('should update an existing oficina', async () => {
    const created = await createOficina({ nombre: 'Oficina Temporal' });

    const response = await request(app)
      .put(`/api/companias/${companiaId}/oficinas/${created.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'Oficina Actualizada', activo: false });

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body.body.data).toEqual(expect.objectContaining({
      id: created.id,
      nombre: 'Oficina Actualizada',
      activo: false,
    }));

    const stored = await inMemoryRepository.findById(companiaId, created.id);
    expect(stored).toEqual(expect.objectContaining({ nombre: 'Oficina Actualizada', activo: false }));
  });

  it('should delete an oficina and remove it from storage', async () => {
    const created = await createOficina({ nombre: 'Oficina para eliminar' });

    const deleteResponse = await request(app)
      .delete(`/api/companias/${companiaId}/oficinas/${created.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteResponse.status).toBe(StatusCodes.OK);
    expect(deleteResponse.body.body.data).toEqual(expect.objectContaining({ message: 'Oficina eliminada exitosamente.' }));

    const stored = await inMemoryRepository.findById(companiaId, created.id);
    expect(stored).toBeNull();

    const getAfterDelete = await request(app)
      .get(`/api/companias/${companiaId}/oficinas/${created.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(getAfterDelete.status).toBe(StatusCodes.NOT_FOUND);
  });

  it('should be stopped by auth middleware for a user with incorrect role', async () => {
    const response = await request(app)
      .post(`/api/companias/${companiaId}/oficinas`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send(baseOficinaPayload);

    expect(response.status).toBe(StatusCodes.FORBIDDEN);
  });

  it('should be stopped by auth middleware if user tries to access another company', async () => {
    const response = await request(app)
      .post(`/api/companias/${anotherCompaniaId}/oficinas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(baseOficinaPayload);

    expect(response.status).toBe(StatusCodes.FORBIDDEN);
  });

  it('should return a 400 Bad Request if the controller throws a validation ApiError', async () => {
    const response = await request(app)
      .post(`/api/companias/${companiaId}/oficinas`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ direccion: 'Una direccion sin nombre' });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.body.error.code).toEqual('VALIDATION_ERROR');
  });
});



