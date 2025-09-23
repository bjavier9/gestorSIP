# Guía Definitiva para Agregar un Endpoint en GestorSIP

Este documento detalla el proceso para agregar un endpoint, explicando la arquitectura real del proyecto, que se basa en **InversifyJS** para la Inyección de Dependencias (DI) y un flujo de arranque claro que separa la configuración del servidor.

---

## Arquitectura Real: Hexagonal con InversifyJS

La arquitectura del proyecto es **Hexagonal (Puertos y Adaptadores)**, pero utiliza **InversifyJS** como un contenedor de DI para gestionar y conectar las dependencias de forma automática. Esto es más escalable y mantenible que la inyección manual.

### Flujo de Arranque: `index.ts` y el Contenedor de Inversify

1.  **`src/config/types.ts`**: Este archivo es un diccionario de identificadores únicos (`Symbol`). Cada "tipo" que queremos que Inversify gestione (un servicio, un repositorio) debe tener una entrada aquí. Esto evita colisiones de nombres y permite una vinculación segura.

2.  **`src/config/container.ts` (El Verdadero "Composition Root")**: Este es el corazón del ensamblaje de la aplicación. Aquí le decimos a Inversify cómo resolver las dependencias:
    *   `container.bind<Interface>(TYPES.InterfaceName).to(ClassName)`: Esta línea le dice al contenedor: "Cuando alguien pida la `Interface` identificada por `TYPES.InterfaceName`, crea y entrégale una instancia de `ClassName`".
    *   **Inyección Automática**: Inversify lee los constructores de las clases. Si el constructor de `EnteService` pide un `IEnteRepository`, el contenedor busca su binding, crea una instancia de `FirebaseEnteRepository` y la inyecta automáticamente.

3.  **`src/index.ts` (El Punto de Entrada)**: Este archivo es el responsable de iniciar la aplicación. Su rol es:
    *   Importar y configurar middleware (Express, Morgan, Swagger).
    *   **Obtener los controladores ya construidos** del contenedor de Inversify: `container.get<AuthController>(TYPES.AuthController)`.
    *   Pasar los controladores a las funciones que crean los routers (ej: `createAuthRouter(authController)`).
    *   Iniciar el servidor (`app.listen()`).

**Nota Importante:** El archivo `src/app.ts` **no se utiliza** en el flujo de arranque actual. Parece ser un vestigio de una configuración anterior con inyección manual. **Debe ser ignorado**.

---

## Proceso Detallado para Agregar un Endpoint con Inversify

Ejemplo: Agregar una nueva funcionalidad para **"Gestionar Pólizas (Policies)"**. Crearemos un endpoint para obtener una póliza por su ID.

### Paso 1: Definir la Lógica de Negocio (Dominio)

1.  **Crear la Entidad (`src/domain/policy.ts`)**:

    ```typescript
    // src/domain/policy.ts
    export interface Policy {
      id: string;
      policyNumber: string;
      clientName: string;
    }
    ```

2.  **Crear el Puerto del Repositorio (`src/domain/ports/policyRepository.port.ts`)**:

    ```typescript
    // src/domain/ports/policyRepository.port.ts
    import { Policy } from '../policy';

    export interface IPolicyRepository {
      findById(id: string): Promise<Policy | null>;
    }
    ```

### Paso 2: Orquestar el Caso de Uso (Aplicación)

1.  **Crear el Servicio (`src/application/policy.service.ts`)**: Este servicio usará el puerto del repositorio. Nota el decorador `@injectable` y el `@inject` en el constructor.

    ```typescript
    // src/application/policy.service.ts
    import { injectable, inject } from 'inversify';
    import { IPolicyRepository } from '../domain/ports/policyRepository.port';
    import { TYPES } from '../config/types';
    import { Policy } from '../domain/policy';

    @injectable()
    export class PolicyService {
      constructor(
        @inject(TYPES.PolicyRepository) private readonly policyRepository: IPolicyRepository
      ) {}

      async findPolicyById(id: string): Promise<Policy | null> {
        return this.policyRepository.findById(id);
      }
    }
    ```

### Paso 3: Implementar la Tecnología (Infraestructura)

1.  **Crear el Adaptador de Persistencia (`src/infrastructure/persistence/firebasePolicyRepository.adapter.ts`)**:

    ```typescript
    // src/infrastructure/persistence/firebasePolicyRepository.adapter.ts
    import { injectable } from 'inversify';
    import { IPolicyRepository } from '../../domain/ports/policyRepository.port';
    import { Policy } from '../../domain/policy';
    import { db } from '../../config/firebase';

    @injectable()
    export class FirebasePolicyRepository implements IPolicyRepository {
      private readonly collection = db.collection('policies');

      async findById(id: string): Promise<Policy | null> {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() } as Policy;
      }
    }
    ```

2.  **Crear el Controlador (`src/infrastructure/http/policy.controller.ts`)**:

    ```typescript
    // src/infrastructure/http/policy.controller.ts
    import { injectable, inject } from 'inversify';
    import { Request, Response, NextFunction } from 'express';
    import { PolicyService } from '../../application/policy.service';
    import { TYPES } from '../../config/types';
    import { responseHandler } from '../../utils/responseHandler';
    import ApiError from '../../utils/ApiError';

    @injectable()
    export class PolicyController {
      constructor(@inject(TYPES.PolicyService) private policyService: PolicyService) {}

      async getPolicyById(req: Request, res: Response, next: NextFunction) {
        try {
          const policy = await this.policyService.findPolicyById(req.params.id);
          if (!policy) throw new ApiError(404, 'Póliza no encontrada');
          responseHandler(res, { statusCode: 200, data: policy, message: 'Póliza obtenida' });
        } catch (error) {
          next(error);
        }
      }
    }
    ```

### Paso 4: Configurar la Inyección de Dependencias

1.  **Añadir Tipos en `src/config/types.ts`**: Agrega los nuevos símbolos para el controlador, servicio y repositorio.

    ```typescript
    // src/config/types.ts
    const TYPES = {
        // ... existing types
        PolicyService: Symbol.for('PolicyService'),
        PolicyRepository: Symbol.for('PolicyRepository'),
        PolicyController: Symbol.for('PolicyController'),
    };
    ```

2.  **Vincular en `src/config/container.ts`**: Enseña a Inversify cómo resolver las nuevas interfaces.

    ```typescript
    // src/config/container.ts
    // ... imports for new classes

    // ... existing bindings

    // BINDINGS PARA POLICIES
    container.bind<IPolicyRepository>(TYPES.PolicyRepository).to(FirebasePolicyRepository);
    container.bind<PolicyService>(TYPES.PolicyService).to(PolicyService);
    container.bind<PolicyController>(TYPES.PolicyController).to(PolicyController);
    ```

### Paso 5: Crear la Ruta y Conectarla en el Servidor

1.  **Crear el Archivo de Rutas (`src/routes/policies.ts`)**:

    ```typescript
    // src/routes/policies.ts
    import { Router } from 'express';
    import { PolicyController } from '../infrastructure/http/policy.controller';

    export const createPolicyRouter = (controller: PolicyController): Router => {
      const router = Router();
      router.get('/:id', (req, res, next) => controller.getPolicyById(req, res, next));
      return router;
    };
    ```

2.  **Usar la Ruta en `src/index.ts`**: Obtén el controlador del contenedor y úsalo para crear y montar el enrutador.

    ```typescript
    // src/index.ts
    // ... imports
    import { PolicyController } from './infrastructure/http/policy.controller'; // Importar nuevo controlador
    import { createPolicyRouter } from './routes/policies'; // Importar nuevo router

    // ... app setup ...

    // --- OBTENER CONTROLADORES DEL CONTENEDOR ---
    const authController = container.get<AuthController>(TYPES.AuthController);
    const enteController = container.get<EnteController>(TYPES.EnteController);
    const policyController = container.get<PolicyController>(TYPES.PolicyController); // <- Obtener nuevo controlador

    // --- ROUTE DEFINITIONS ---
    // ... rutas existentes ...

    // --- RUTAS PROTEGIDAS ---
    // ...
    apiRouter.use('/policies', createPolicyRouter(policyController)); // <- Usar el nuevo enrutador
    // ...
    ```

¡Listo! Acabas de agregar un nuevo módulo completo a la aplicación siguiendo su arquitectura real, asegurando que el código esté limpio, desacoplado y sea fácil de mantener a largo plazo.
