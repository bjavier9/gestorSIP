# Guia para agregar una nueva ruta y funcionalidad en GestorSIP

> Esta guia sirve para cualquier persona, incluso si no tiene experiencia tecnica. Sigue los pasos en orden y tendras tu nuevo modulo funcionando, documentado en Swagger y conectado a Firebase.

---

## 1. Requisitos rapidos

- Node.js y npm instalados en tu computadora.
- Firebase ya inicializado (el proyecto ya incluye la configuracion en src/config/firebase.ts).
- Archivo .env con los valores correctos:
  - FIREBASE_PROJECT_ID
  - FIREBASE_CLIENT_EMAIL
  - FIREBASE_PRIVATE_KEY
  - JWT_SECRET
- Un editor de texto (Visual Studio Code funciona perfecto) y acceso a este repositorio.

Si te falta algo de la lista, pide ayuda antes de continuar.

---

## 2. Entiende la arquitectura en 2 minutos

GestorSIP usa capas muy claras. Siempre repetimos la misma secuencia:

| Capa | Carpeta | Funcion |
|------|---------|---------|
| Ruta (Route) | src/routes | Define la URL disponible, por ejemplo /api/tareas |
| Controlador | src/infrastructure/http | Recibe la peticion HTTP, valida datos y llama al servicio |
| Servicio | src/application | Aplica reglas de negocio: que se guarda, que se actualiza, etc. |
| Repositorio / Adaptador | src/infrastructure/persistence | Guarda y consulta datos en Firebase |
| Dominio | src/domain | Estructuras de datos (interfaces, tipos) |
| Contenedor | src/config/container.ts | Conecta todas las piezas con Inversify |

Cada vez que crees una nueva funcionalidad repetiras estos pasos.

---

## 3. Ejemplo completo: modulo de "Tareas"

Supongamos que necesitamos CRUD de tareas con los endpoints:
- POST /api/tareas
- GET /api/tareas
- GET /api/tareas/:id
- PUT /api/tareas/:id
- DELETE /api/tareas/:id

### Paso 1. Define el modelo en el dominio
Archivo nuevo: src/domain/tarea.ts

```ts
export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  estado: 'pendiente' | 'en_proceso' | 'completada';
  fechaCreacion: Date;
  fechaActualizacion: Date;
}
```

Puedes agregar interfaces auxiliares si las necesitas (por ejemplo CrearTareaInput).

### Paso 2. Crea la interfaz del repositorio
Archivo nuevo: src/domain/ports/tareaRepository.port.ts

```ts
import { Tarea } from '../tarea';

export interface TareaRepository {
  create(data: Omit<Tarea, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<Tarea>;
  findAll(): Promise<Tarea[]>;
  findById(id: string): Promise<Tarea | null>;
  update(id: string, data: Partial<Omit<Tarea, 'id' | 'fechaCreacion'>>): Promise<Tarea>;
  delete(id: string): Promise<void>;
}
```

### Paso 3. Implementa el repositorio con Firebase
Archivo nuevo: src/infrastructure/persistence/firebaseTarea.adapter.ts

```ts
import { injectable } from 'inversify';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { TareaRepository } from '../../domain/ports/tareaRepository.port';
import { Tarea } from '../../domain/tarea';
import { ApiError } from '../../utils/ApiError';

@injectable()
export class FirebaseTareaAdapter implements TareaRepository {
  private get collection() {
    return getFirestore().collection('tareas');
  }

  private toTarea(doc: FirebaseFirestore.DocumentSnapshot): Tarea {
    if (!doc.exists) {
      throw new ApiError('NOT_FOUND', 'Tarea no encontrada.', 404);
    }
    const data = doc.data()!;
    const toDate = (value: any) => value instanceof Timestamp ? value.toDate() : new Date(value);

    return {
      id: doc.id,
      titulo: data.titulo,
      descripcion: data.descripcion,
      estado: data.estado,
      fechaCreacion: toDate(data.fechaCreacion),
      fechaActualizacion: toDate(data.fechaActualizacion),
    };
  }

  async create(data: Omit<Tarea, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<Tarea> {
    const now = new Date();
    const docRef = this.collection.doc();
    await docRef.set({ ...data, fechaCreacion: now, fechaActualizacion: now });
    return this.toTarea(await docRef.get());
  }

  async findAll(): Promise<Tarea[]> {
    const snapshot = await this.collection.orderBy('fechaCreacion', 'desc').get();
    return snapshot.docs.map(doc => this.toTarea(doc));
  }

  async findById(id: string): Promise<Tarea | null> {
    const doc = await this.collection.doc(id).get();
    return doc.exists ? this.toTarea(doc) : null;
  }

  async update(id: string, data: Partial<Omit<Tarea, 'id' | 'fechaCreacion'>>): Promise<Tarea> {
    const docRef = this.collection.doc(id);
    await docRef.set({ ...data, fechaActualizacion: new Date() }, { merge: true });
    return this.toTarea(await docRef.get());
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }
}
```

### Paso 4. Crea el servicio (logica de negocio)
Archivo nuevo: src/application/tarea.service.ts

```ts
import { inject, injectable } from 'inversify';
import { TYPES } from '../config/types';
import { TareaRepository } from '../domain/ports/tareaRepository.port';
import { Tarea } from '../domain/tarea';
import { ApiError } from '../utils/ApiError';

interface CrearTareaInput {
  titulo: string;
  descripcion?: string;
}

interface ActualizarTareaInput {
  titulo?: string;
  descripcion?: string;
  estado?: Tarea['estado'];
}

@injectable()
export class TareaService {
  constructor(
    @inject(TYPES.TareaRepository) private readonly tareaRepository: TareaRepository,
  ) {}

  async crear(data: CrearTareaInput): Promise<Tarea> {
    if (!data.titulo) {
      throw new ApiError('VALIDATION_ERROR', 'El titulo es obligatorio.', 400);
    }
    return this.tareaRepository.create({
      titulo: data.titulo,
      descripcion: data.descripcion ?? '',
      estado: 'pendiente',
    });
  }

  async listar(): Promise<Tarea[]> {
    return this.tareaRepository.findAll();
  }

  async obtener(id: string): Promise<Tarea> {
    const tarea = await this.tareaRepository.findById(id);
    if (!tarea) {
      throw new ApiError('NOT_FOUND', 'La tarea no existe.', 404);
    }
    return tarea;
  }

  async actualizar(id: string, data: ActualizarTareaInput): Promise<Tarea> {
    await this.obtener(id);
    return this.tareaRepository.update(id, data);
  }

  async eliminar(id: string): Promise<void> {
    await this.obtener(id);
    await this.tareaRepository.delete(id);
  }
}
```

### Paso 5. Controlador HTTP (incluye Swagger)
Archivo nuevo: src/infrastructure/http/tarea.controller.ts

```ts
import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TareaService } from '../../application/tarea.service';
import { handleSuccess } from '../../utils/responseHandler';
import { TYPES } from '../../config/types';

/**
 * @swagger
 * tags:
 *   name: Tareas
 *   description: Gestion de tareas.
 */
@injectable()
export class TareaController {
  constructor(@inject(TYPES.TareaService) private readonly tareaService: TareaService) {}

  /**
   * @swagger
   * /api/tareas:
   *   post:
   *     tags: [Tareas]
   *     summary: Crea una nueva tarea.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [titulo]
   *             properties:
   *               titulo:
   *                 type: string
   *               descripcion:
   *                 type: string
   *     responses:
   *       201:
   *         description: Tarea creada.
   */
  async crear(req: Request, res: Response) {
    const tarea = await this.tareaService.crear(req.body);
    handleSuccess(req, res, tarea, 201);
  }

  /**
   * @swagger
   * /api/tareas:
   *   get:
   *     tags: [Tareas]
   *     summary: Lista todas las tareas.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de tareas.
   */
  async listar(req: Request, res: Response) {
    const tareas = await this.tareaService.listar();
    handleSuccess(req, res, tareas);
  }

  /**
   * @swagger
   * /api/tareas/{id}:
   *   get:
   *     tags: [Tareas]
   *     summary: Obtiene una tarea.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Tarea encontrada.
   */
  async obtener(req: Request, res: Response) {
    const tarea = await this.tareaService.obtener(req.params.id);
    handleSuccess(req, res, tarea);
  }

  /**
   * @swagger
   * /api/tareas/{id}:
   *   put:
   *     tags: [Tareas]
   *     summary: Actualiza una tarea.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               titulo:
   *                 type: string
   *               descripcion:
   *                 type: string
   *               estado:
   *                 type: string
   *                 enum: [pendiente, en_proceso, completada]
   *     responses:
   *       200:
   *         description: Tarea actualizada.
   */
  async actualizar(req: Request, res: Response) {
    const tarea = await this.tareaService.actualizar(req.params.id, req.body);
    handleSuccess(req, res, tarea);
  }

  /**
   * @swagger
   * /api/tareas/{id}:
   *   delete:
   *     tags: [Tareas]
   *     summary: Elimina una tarea.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Tarea eliminada.
   */
  async eliminar(req: Request, res: Response) {
    await this.tareaService.eliminar(req.params.id);
    handleSuccess(req, res, { message: 'Tarea eliminada correctamente.' });
  }
}
```

### Paso 6. Define las rutas
Archivo nuevo: src/routes/tareas.ts

```ts
import { Router } from 'express';
import { Container } from 'inversify';
import { TYPES } from '../config/types';
import { TareaController } from '../infrastructure/http/tarea.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/asyncHandler';

export const createTareaRoutes = (container: Container): Router => {
  const router = Router();
  const controller = container.get<TareaController>(TYPES.TareaController);

  router.use(authMiddleware);
  router.post('/', asyncHandler(controller.crear.bind(controller)));
  router.get('/', asyncHandler(controller.listar.bind(controller)));
  router.get('/:id', asyncHandler(controller.obtener.bind(controller)));
  router.put('/:id', asyncHandler(controller.actualizar.bind(controller)));
  router.delete('/:id', asyncHandler(controller.eliminar.bind(controller)));

  return router;
};
```

### Paso 7. Actualiza el contenedor y los tipos

1. src/config/types.ts

```ts
    TareaRepository: Symbol.for('TareaRepository'),
    TareaService: Symbol.for('TareaService'),
    TareaController: Symbol.for('TareaController'),
```

2. src/config/container.ts

```ts
import { TareaService } from '../application/tarea.service';
import { TareaController } from '../infrastructure/http/tarea.controller';
import { TareaRepository } from '../domain/ports/tareaRepository.port';
import { FirebaseTareaAdapter } from '../infrastructure/persistence/firebaseTarea.adapter';
```

```ts
    container.bind<TareaRepository>(TYPES.TareaRepository).to(FirebaseTareaAdapter);
    container.bind<TareaService>(TYPES.TareaService).to(TareaService);
    container.bind<TareaController>(TYPES.TareaController).to(TareaController);
```

### Paso 8. Agrega las rutas en el servidor principal

src/index.ts

```ts
import { createTareaRoutes } from './routes/tareas';
...
    app.use('/api/tareas', createTareaRoutes(container));
```

### Paso 9. Registra el esquema en Swagger

src/config/swagger.ts

```ts
                Tarea: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        titulo: { type: 'string' },
                        descripcion: { type: 'string' },
                        estado: { type: 'string', enum: ['pendiente', 'en_proceso', 'completada'] },
                        fechaCreacion: { type: 'string', format: 'date-time' },
                        fechaActualizacion: { type: 'string', format: 'date-time' },
                    },
                },
```

Los comentarios `@swagger` del controlador hacen que los endpoints aparezcan automaticamente.

### Paso 10. Prueba todo

1. Compila rapido: `npm run build`
2. Ejecuta el servidor: `npm run dev`
3. Consigue un token JWT (login Firebase o super admin) y prueba los endpoints en Postman o Thunder Client.
4. Abre `http://localhost:3000/api-docs` para ver la documentacion generada.

### Paso 11. Checklist final

- [ ] Archivos nuevos creados en las carpetas correctas.
- [ ] `types.ts`, `container.ts` e `index.ts` actualizados.
- [ ] Endpoints probados con token valido.
- [ ] Mensajes de error claros para usuario final.
- [ ] Swagger muestra los nuevos endpoints y el esquema Tarea.

Si todo esta ok, puedes repetir la receta para cualquier otro recurso (clientes, notas, etc.). Cambia los nombres y los campos segun lo que necesites.

---

## 4. Consejos finales

- Empieza copiando archivos de un modulo similar y cambia nombres: es la forma mas rapida.
- Usa nombres en minusculas para las colecciones de Firebase (`tareas`, `clientes`, etc.).
- Si un endpoint debe ser solo para ciertos roles, agrega la validacion en el servicio.
- Antes de subir cambios ejecuta `npm run build` para comprobar que no hay errores de TypeScript.
- Si te atoras, pide ayuda mostrando en que paso de esta guia te quedaste.

Listo. Con estos pasos agregas una funcionalidad nueva de principio a fin.
