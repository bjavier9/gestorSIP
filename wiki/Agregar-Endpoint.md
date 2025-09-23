# Guía Definitiva para Agregar un Endpoint en GestorSIP

Este documento detalla el proceso completo y actualizado para agregar un nuevo endpoint, reflejando la arquitectura real del proyecto, que se basa en **InversifyJS** para la Inyección de Dependencias (DI) y un flujo de arranque asíncrono que garantiza la estabilidad.

---

## Arquitectura y Flujo de Arranque

La arquitectura es **Hexagonal (Puertos y Adaptadores)** con InversifyJS como contenedor de DI. El flujo de arranque en `src/index.ts` es clave:

1.  **Inicialización de Servicios Externos**: La función `startServer` primero llama y espera a `initializeFirebase()`.
2.  **Carga Dinámica de Módulos**: **Después** de que Firebase está listo, se usan `await import()` para cargar los routers. Esto evita errores de servicios no disponibles.
3.  **Configuración del Servidor Express**: Finalmente, se configura y se inicia el servidor.

Cualquier nuevo módulo de rutas que creemos deberá ser importado de esta manera en `src/index.ts`.

---

## Proceso Paso a Paso: Ejemplo de un Endpoint `GET /polizas/:id`

Vamos a crear un endpoint completo para obtener una póliza por su ID.

### Paso 1: Definir los Tipos en `types.ts`

Antes de crear cualquier clase que necesite ser inyectada, debemos declarar sus identificadores. Esto previene colisiones y errores de DI.

```typescript
// src/config/types.ts

export const TYPES = {
    // ... otros tipos existentes
    AuthService: Symbol.for("AuthService"),
    AuthController: Symbol.for("AuthController"),
    // ... etc

    // --- Tipos para el nuevo módulo de Pólizas ---
    PolizaRepository: Symbol.for("PolizaRepository"),
    PolizaService: Symbol.for("PolizaService"),
    PolizaController: Symbol.for("PolizaController"),
};
```

### Paso 2: El Núcleo del Dominio

Aquí definimos la entidad de negocio y el "puerto" (la interfaz del repositorio).

**1. Crear la Entidad `poliza.ts`:**
```typescript
// src/domain/poliza.ts

export interface Poliza {
    id: string;
    numero: string;
    aseguradoId: string;
    compania: string;
    ramo: string;
    fechaVencimiento: Date;
    // ...otras propiedades
}
```

**2. Crear el Puerto del Repositorio `polizaRepository.port.ts`:**
```typescript
// src/domain/ports/polizaRepository.port.ts

import { Poliza } from '../poliza';

export interface PolizaRepository {
    findById(id: string): Promise<Poliza | null>;
    // ...otros métodos como findAll, save, etc.
}
```

### Paso 3: La Lógica de la Aplicación (Caso de Uso)

Creamos el servicio que orquesta la lógica de negocio, usando el puerto del dominio pero sin conocer la implementación.

```typescript
// src/application/poliza.service.ts

import { inject, injectable } from 'inversify';
import { PolizaRepository } from '../domain/ports/polizaRepository.port';
import { Poliza } from '../domain/poliza';
import { TYPES } from '../config/types';
import { ApiError } from '../utils/ApiError';

@injectable()
export class PolizaService {
    constructor(
        @inject(TYPES.PolizaRepository) private polizaRepository: PolizaRepository
    ) {}

    public async getPolizaById(id: string): Promise<Poliza> {
        const poliza = await this.polizaRepository.findById(id);
        if (!poliza) {
            throw new ApiError('POLIZA_NOT_FOUND', 404, `La póliza con id ${id} no fue encontrada.`);
        }
        return poliza;
    }
}
```

### Paso 4: La Capa de Infraestructura

Aquí implementamos la tecnología específica (Firebase, Express).

**1. Crear el Adaptador del Repositorio `firebasePolizaRepository.adapter.ts`:**
```typescript
// src/infrastructure/persistence/firebasePolizaRepository.adapter.ts

import { injectable } from 'inversify';
import { PolizaRepository } from '../../domain/ports/polizaRepository.port';
import { Poliza } from '../../domain/poliza';
import { db } from '../../config/firebase';
import { ApiError } from '../../utils/ApiError';

@injectable()
export class FirebasePolizaRepository implements PolizaRepository {
    private readonly collection = db.collection('polizas');

    async findById(id: string): Promise<Poliza | null> {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) {
            return null;
        }
        return { id: doc.id, ...doc.data() } as Poliza;
    }
    // Implementar otros métodos...
}
```

**2. Crear el Controlador `poliza.controller.ts`:**
```typescript
// src/infrastructure/http/poliza.controller.ts

import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { PolizaService } from '../../application/poliza.service';
import { TYPES } from '../../config/types';

@injectable()
export class PolizaController {
    constructor(
        @inject(TYPES.PolizaService) private polizaService: PolizaService
    ) {}

    async getById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const poliza = await this.polizaService.getPolizaById(id);
        // Suponiendo que tienes un manejador de respuestas exitosas
        res.status(200).json(poliza);
    }
}
```

### Paso 5: Vincular Todo en el Contenedor de Inversify

Ahora le decimos a Inversify qué implementación concreta usar cuando se solicite una interfaz (un puerto).

```typescript
// src/config/container.ts

// ... imports
import { PolizaRepository } from '../domain/ports/polizaRepository.port';
import { FirebasePolizaRepository } from '../infrastructure/persistence/firebasePolizaRepository.adapter';
import { PolizaService } from '../application/poliza.service';
import { PolizaController } from '../infrastructure/http/poliza.controller';

// ... vinculaciones existentes

// --- Vinculaciones del Módulo de Pólizas ---
container.bind<PolizaRepository>(TYPES.PolizaRepository).to(FirebasePolizaRepository);
container.bind<PolizaService>(TYPES.PolizaService).to(PolizaService);
container.bind<PolizaController>(TYPES.PolizaController).to(PolizaController);

export default container;
```

### Paso 6: Crear y Documentar la Ruta

Finalmente, creamos el archivo de la ruta y lo conectamos al controlador. También añadimos la documentación de Swagger aquí.

```typescript
// src/routes/polizas.ts

import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import container from '../config/container';
import { TYPES } from '../config/types';
import { PolizaController } from '../infrastructure/http/poliza.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const polizaController = container.get<PolizaController>(TYPES.PolizaController);

const router = Router();

/**
 * @swagger
 * /api/polizas/{id}:
 *   get:
 *     tags: [Pólizas]
 *     summary: Obtener una póliza por su ID
 *     description: Retorna los detalles de una póliza específica.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: El ID único de la póliza.
 *     responses:
 *       200:
 *         description: Póliza encontrada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Poliza' // Asumiendo que defines Poliza en swagger.ts
 *       404:
 *         description: Póliza no encontrada.
 */
router.get('/:id', authMiddleware, asyncHandler(polizaController.getById.bind(polizaController)));

export default router;
```

*No olvides también agregar el schema de `Poliza` en `src/config/swagger.ts`.*

### Paso 7: Conectar la Ruta en `index.ts`

El último paso es importar dinámicamente y usar el nuevo router en el punto de entrada de la aplicación.

```typescript
// src/index.ts

async function startServer() {
    // ... inicialización y otras importaciones

    // --- 2. DYNAMICALLY IMPORT MODULES ---
    const { default: authRouter } = await import('./routes/auth');
    const { default: enteRouter } = await import('./routes/entes');
    const { default: contentRouter } = await import('./routes/content');
    const { default: polizaRouter } = await import('./routes/polizas'); // <-- AÑADIR
    
    // ...

    // --- 3. CREATE AND CONFIGURE EXPRESS APP ---
    // ...

    // API Routes
    app.use('/api/auth', authRouter);
    app.use('/api/entes', enteRouter);
    app.use('/api/content', contentRouter);
    app.use('/api/polizas', polizaRouter); // <-- AÑADIR

    // ... resto del archivo
}

startServer().catch(/*...*/);
```

---

¡Listo! Acabas de agregar un nuevo módulo completo a la aplicación siguiendo su arquitectura real, asegurando que el código esté limpio, desacoplado y sea fácil de mantener a largo plazo.
