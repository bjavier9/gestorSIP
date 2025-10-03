# Guia Avanzada para Agregar un Endpoint en GestorSIP

GestorSIP implementa una arquitectura hexagonal apoyada en InversifyJS para inyectar dependencias y asegura que cada modulo se cargue solo despues de que `initializeFirebase()` haya completado. Esta guia resume el flujo esperado y muestra un ejemplo completo sobre como publicar un nuevo endpoint sin romper el arranque asincrono ni las reglas de seguridad.

---

## Checklist rapida

- Validar el caso de uso y la entidad de dominio involucrada.
- Crear o actualizar tipos y puertos en `src/domain` y `src/domain/ports`.
- Declarar identificadores en `src/config/types.ts`.
- Implementar el servicio de aplicacion en `src/application`.
- Crear el controlador HTTP en `src/infrastructure/http`.
- Registrar bindings en `src/config/container.ts`.
- Disenar el router en `src/routes`, aplicando `authMiddleware` y cualquier middleware de rol o scoping.
- Documentar el endpoint con Swagger JSDoc.
- Anadir pruebas manuales (o scripts dedicados) usando tokens reales o `POST /api/auth/test-token`.
- Actualizar la wiki y el registro de cambios correspondiente.

---

## Arquitectura y flujo de arranque

1. `startServer()` (en `src/index.ts`) espera a `initializeFirebase()` antes de importar dinamicamente los routers (`await import('./routes/...')`).
2. Cada router resuelve sus controladores a traves del contenedor de Inversify, por lo que los bindings deben existir antes de que Express intente usarlos.
3. Todas las respuestas deben emitirse con `handleSuccess` o levantar `ApiError` para asegurar un formato consistente.

Mantener estas reglas evita que el servidor suba con dependencias sin enlazar o servicios externos sin inicializar.

---

## Paso a paso general

1. **Definir dominio y puertos**
   - Modela la entidad o agrega nuevos metodos en el puerto correspondiente.
   - Usa `Omit<T, ...>` para entradas de creacion y `Partial<T>` para updates.

2. **Implementar el adaptador de infraestructura**
   - Coloca la implementacion (Firestore, REST externo, etc.) en `src/infrastructure/persistence`.
   - Maneja conversiones de tipos (por ejemplo `Date`) y errores coherentes.

3. **Escribir el servicio de aplicacion**
   - El servicio vive en `src/application`.
   - Orquesta reglas de negocio, valida entrada (campos obligatorios, roles), y propaga `ApiError` con codigos HTTP apropiados.

4. **Crear el controlador HTTP**
   - En `src/infrastructure/http`, inyecta el servicio mediante Inversify.
   - No crees instancias manualmente; usa los helpers `handleSuccess` / `handleError`.
   - Conviertelo en el punto donde se hace `bind` de `this`.

5. **Registrar bindings de DI**
   - Anade los simbolos al objeto `TYPES`.
   - En `src/config/container.ts`, enlaza interfaz -> implementacion con `container.bind<Interface>(TYPES.Nombre).to(Clase)`.

6. **Disenar el router**
   - Ubica el archivo en `src/routes`.
   - Instancia el controlador via `container.get`.
   - Protege cada ruta con `authMiddleware` y, si aplica, con middlewares de rol como `agentSupervisorMiddleware` o `authorizeCompaniaAccess`.
   - Documenta el endpoint usando comentarios Swagger JSDoc (ver ejemplos existentes).
   - Recuerda exportar `router` como default.

7. **Montar la ruta en `index.ts`**
   - Importa el router y configura el path base con `app.use('/api/...', router)`.
   - Si el router depende de parametros padre, usa `Router({ mergeParams: true })` y monta con la base adecuada (por ejemplo `/api/companias/:companiaId/oficinas`).

8. **Documentar y probar**
   - Reinicia el servidor para regenerar `/api-docs`.
   - Valida la ruta con Postman o `curl`.
   - Actualiza la wiki (ver seccion "Documentar endpoints") y, si corresponde, agrega escenarios a `tests/`.

---

## Buenas practicas clave

- **Codigos HTTP**: usa `201` al crear, `200` para lecturas o updates y `204` cuando no hay cuerpo (delete).
- **Seguridad**: toda ruta con datos de negocio debe pasar por `authMiddleware`. Limita roles con los helpers ya disponibles.
- **Errores**: lanza `ApiError(code, message, status)` para mantener respuestas uniformes.
- **Respuestas**: devuelve objetos completos del dominio o DTOs consumibles por frontend, nunca datos crudos de Firestore sin filtrar.
- **Nombres**: los archivos siguen el patron `<recurso>.controller.ts`, `<recurso>.service.ts`, `<recurso>.ts` (router).

---

## Ejemplo completo: GET /api/polizas/:id

El flujo siguiente muestra como agregar un modulo nuevo para consultar polizas.

### 1. Declarar tipos y simbolos

```typescript
// src/config/types.ts
export const TYPES = {
  // ... existentes
  PolizaRepository: Symbol.for('PolizaRepository'),
  PolizaService: Symbol.for('PolizaService'),
  PolizaController: Symbol.for('PolizaController'),
};
```

```typescript
// src/domain/poliza.ts
export interface Poliza {
  id: string;
  numero: string;
  aseguradoId: string;
  compania: string;
  ramo: string;
  fechaVencimiento: Date;
  // campos adicionales segun el negocio
}
```

```typescript
// src/domain/ports/polizaRepository.port.ts
import { Poliza } from '../poliza';

export interface PolizaRepository {
  findById(id: string): Promise<Poliza | null>;
  // agrega aqui findAll, save, etc. cuando sea necesario
}
```

### 2. Servicio de aplicacion

```typescript
// src/application/poliza.service.ts
import { inject, injectable } from 'inversify';
import { PolizaRepository } from '../domain/ports/polizaRepository.port';
import { TYPES } from '../config/types';
import { ApiError } from '../utils/ApiError';

@injectable()
export class PolizaService {
  constructor(
    @inject(TYPES.PolizaRepository) private readonly repo: PolizaRepository,
  ) {}

  async getPolizaById(id: string) {
    const poliza = await this.repo.findById(id);
    if (!poliza) {
      throw new ApiError('POLIZA_NOT_FOUND', `Poliza ${id} no encontrada.`, 404);
    }
    return poliza;
  }
}
```

### 3. Adaptador de infraestructura

```typescript
// src/infrastructure/persistence/firebasePolizaRepository.adapter.ts
import { injectable } from 'inversify';
import { PolizaRepository } from '../../domain/ports/polizaRepository.port';
import { Poliza } from '../../domain/poliza';
import { db } from '../../config/firebase';

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
}
```

### 4. Controlador HTTP

```typescript
// src/infrastructure/http/poliza.controller.ts
import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { PolizaService } from '../../application/poliza.service';
import { TYPES } from '../../config/types';
import { handleSuccess } from '../../utils/responseHandler';

@injectable()
export class PolizaController {
  constructor(
    @inject(TYPES.PolizaService) private readonly service: PolizaService,
  ) {}

  async getById(req: Request, res: Response) {
    const poliza = await this.service.getPolizaById(req.params.id);
    handleSuccess(res, poliza);
  }
}
```

### 5. Registrar bindings

```typescript
// src/config/container.ts
container.bind<PolizaRepository>(TYPES.PolizaRepository).to(FirebasePolizaRepository);
container.bind<PolizaService>(TYPES.PolizaService).to(PolizaService);
container.bind<PolizaController>(TYPES.PolizaController).to(PolizaController);
```

### 6. Crear el router

```typescript
// src/routes/polizas.ts
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import container from '../config/container';
import { TYPES } from '../config/types';
import { PolizaController } from '../infrastructure/http/poliza.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const controller = container.get<PolizaController>(TYPES.PolizaController);

/**
 * @swagger
 * /api/polizas/{id}:
 *   get:
 *     tags: [Polizas]
 *     summary: Obtener detalles de una poliza
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200: { description: 'Poliza encontrada' }
 *       404: { description: 'Poliza no encontrada' }
 */
router.get('/:id', authMiddleware, asyncHandler(controller.getById.bind(controller)));

export default router;
```

### 7. Montar la ruta

```typescript
// src/index.ts
const { default: polizaRouter } = await import('./routes/polizas');
app.use('/api/polizas', polizaRouter);
```

### 8. Verificacion rapida

- Genera un token valido (o usa `/api/auth/test-token` en entornos permitidos).
- Haz `curl -H "Authorization: Bearer <token>" http://localhost:3000/api/polizas/demo`.
- Confirma que Swagger (`/api-docs`) lista el nuevo endpoint bajo la categoria correcta.
- Actualiza la documentacion del wiki para reflejar el nuevo recurso.

---

## Documentar endpoints

Cada vez que agregues o modifiques rutas:

1. Actualiza la tabla de rutas en `README.md` si cambia la superficie publica.
2. Anade una entrada en `wiki/endpoints/<recurso>.md` con:
   - Metodo y path.
   - Roles requeridos o middlewares aplicados.
   - Cuerpo de solicitud y respuesta (JSON de ejemplo).
   - Errores comunes (`ApiError` codes).
3. Si el flujo afecta autenticacion, revisa `wiki/Authentication-Flow.md`.

Seguir esta guia mantiene el backend consistente, predecible y facil de escalar.
