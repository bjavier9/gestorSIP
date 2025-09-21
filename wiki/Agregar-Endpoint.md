# Guía para Agregar un Nuevo Endpoint en GestorSIP

Este documento detalla el proceso paso a paso para agregar un nuevo endpoint a la API, siguiendo la arquitectura hexagonal (Puertos y Adaptadores) del proyecto.

## Mapa de Carpetas Relevantes

Para agregar una nueva funcionalidad, necesitarás trabajar principalmente en las siguientes carpetas dentro de `src/`:

```
src/
├── application/    # Contiene los servicios (lógica de orquestación)
├── domain/
│   ├── ports/      # Contiene las interfaces (puertos) de los repositorios
│   └── *.ts        # Contiene las entidades/modelos de dominio
├── infrastructure/
│   ├── http/       # Contiene los controladores (manejo de peticiones HTTP)
│   └── persistence/ # Contiene las implementaciones de los repositorios (adaptadores)
└── routes/         # Contiene la definición de las rutas de la API
```

---

## Proceso Detallado

Vamos a ilustrar el proceso con un ejemplo: "Obtener un `Ente` por su ID".

### Paso 1: Definir la Entidad y el Puerto (Capa de Dominio)

1.  **Entidad (`src/domain/ente.ts`):** Asegúrate de que la entidad que necesitas ya esté definida. En nuestro caso, `Ente` ya existe.

    ```typescript
    // src/domain/ente.ts
    export interface Ente {
      id: string;
      nombre: string;
      // ...otras propiedades
    }
    ```

2.  **Puerto del Repositorio (`src/domain/ports/enteRepository.port.ts`):** Agrega la firma del nuevo método a la interfaz del repositorio. Esto define la operación que la capa de aplicación podrá usar, sin saber cómo se implementa.

    ```typescript
    // src/domain/ports/enteRepository.port.ts
    import { Ente } from '../ente';

    export interface IEnteRepository {
      // ... otros métodos existentes
      findById(id: string): Promise<Ente | null>; // <- Nuevo método
    }
    ```

### Paso 2: Crear o Actualizar el Servicio (Capa de Aplicación)

El servicio orquesta la lógica de negocio. Llama al método del repositorio a través del puerto.

1.  **Servicio (`src/application/ente.service.ts`):** Agrega un método que utilice el nuevo método del repositorio.

    ```typescript
    // src/application/ente.service.ts
    import { IEnteRepository } from '../domain/ports/enteRepository.port';
    import { Ente } from '../domain/ente';

    export class EnteService {
      constructor(private readonly enteRepository: IEnteRepository) {}

      // ... otros métodos

      async findEnteById(id: string): Promise<Ente | null> {
        // Aquí podrías agregar lógica de negocio adicional si fuera necesario
        return this.enteRepository.findById(id);
      }
    }
    ```

### Paso 3: Implementar el Adaptador y el Controlador (Capa de Infraestructura)

1.  **Implementación del Repositorio (`src/infrastructure/persistence/firebaseEnteRepository.adapter.ts`):** Ahora, implementa la lógica específica de la base de datos para el método que definiste en el puerto.

    ```typescript
    // src/infrastructure/persistence/firebaseEnteRepository.adapter.ts
    import { IEnteRepository } from '../../domain/ports/enteRepository.port';
    import { Ente } from '../../domain/ente';
    import { db } from '../../config/firebase'; // Tu configuración de Firebase

    export class FirebaseEnteRepository implements IEnteRepository {
      private readonly collection = db.collection('entes');

      // ... otras implementaciones

      async findById(id: string): Promise<Ente | null> {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) {
          return null;
        }
        return { id: doc.id, ...doc.data() } as Ente;
      }
    }
    ```

2.  **Controlador (`src/infrastructure/http/ente.controller.ts`):** Crea el método en el controlador que manejará la petición HTTP, llamará al servicio y enviará la respuesta.

    ```typescript
    // src/infrastructure/http/ente.controller.ts
    import { Request, Response, NextFunction } from 'express';
    import { EnteService } from '../../application/ente.service';
    import { responseHandler } from '../../utils/responseHandler';
    import ApiError from '../../utils/ApiError';

    export class EnteController {
      constructor(private readonly enteService: EnteService) {}

      // ... otros métodos

      async getEnteById(req: Request, res: Response, next: NextFunction) {
        try {
          const { id } = req.params;
          const ente = await this.enteService.findEnteById(id);
          if (!ente) {
            throw new ApiError(404, 'Ente no encontrado');
          }
          responseHandler(res, {
            statusCode: 200,
            data: ente,
            message: 'Ente obtenido con éxito',
          });
        } catch (error) {
          next(error);
        }
      }
    }
    ```

### Paso 4: Definir la Ruta (Capa de Ruteo)

1.  **Archivo de Rutas (`src/routes/entes.ts`):** Agrega la nueva ruta y vincúlala al método del controlador.

    ```typescript
    // src/routes/entes.ts
    import { Router } from 'express';
    import { EnteController } from '../infrastructure/http/ente.controller';
    import { authMiddleware } from '../middleware/authMiddleware'; // Asumiendo que requiere autenticación

    export default (enteController: EnteController): Router => {
      const router = Router();

      // ... otras rutas

      router.get(
        '/:id',
        authMiddleware,
        (req, res, next) => enteController.getEnteById(req, res, next)
      );

      return router;
    };
    ```

### Paso 5: Conectar Dependencias (en `src/app.ts` o contenedor DI)

Finalmente, asegúrate de que todas las nuevas clases (o las actualizadas) estén correctamente instanciadas e inyectadas en el punto de entrada de la aplicación. En este proyecto, se hace manualmente en `src/app.ts`.

1.  **Actualizar `src/app.ts`:** No hay cambios necesarios en `app.ts` para este ejemplo específico si el `enteController` ya estaba siendo instanciado y pasado al enrutador de `entes`. El sistema de inyección manual y el enrutador dinámico se encargan de conectar todo.

¡Y eso es todo! Has agregado un nuevo endpoint siguiendo un patrón limpio y desacoplado.
