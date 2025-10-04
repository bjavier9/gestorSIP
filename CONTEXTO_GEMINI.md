# CONTEXTO_GEMINI
# Proyecto GestorSIP - Contexto actualizado para herramientas LLM

### 1. Panorama general
- API backend en Node.js + Express, escrito en TypeScript.
- Arquitectura hexagonal (dominio, aplicacion, infraestructura, rutas, config, utils).
- InversifyJS maneja DI y resolucion de dependencias.
- Firebase Admin SDK provee autenticacion (creacion de usuarios) y Firestore como base de datos.
- Todas las respuestas HTTP de controladores deben usar `handleSuccess` o `handleError` para exponer `{ success, status, data }`.
- El servidor se levanta desde `src/index.ts`. Inicializa Firebase, carga rutas dinamicamente y expone Swagger en `/api-docs`.

### 2. Directivas criticas
1. **FIREBASE_CONFIG_LOCK**: no modificar `src/config/firebase.ts`; lee credenciales desde `firebase-credentials.json` en raiz.
2. **SUPERADMIN_ENFORCEMENT**: rutas de companias requieren rol `superadmin` y correo igual a `process.env.SUPERADMIN_EMAIL` (middleware `superAdminMiddleware`).
3. **CONTENT_API_REMOVED**: las rutas `/api/content` fueron eliminadas. No reintroducir sin requerimiento explicito.
4. **USER_COMPANIA_ROLES**: solo roles admin, supervisor o superadmin pueden crear/habilitar/inhabilitar documentos en `usuarios_companias`.
5. **GESTIONES_ROLE_CONTROL**: solo roles agent y supervisor pueden crear, actualizar o eliminar gestiones. Lectura habilitada para cualquier usuario autenticado de la compania.

### 3. Tecnologias y convenciones
- Node 18+, npm scripts (`npm run dev`, `npm run build`).
- TypeScript estricto (`strict: true`).
- Firestore trabaja con colecciones principales:
  - `companias_corretaje`
  - `oficinas` (subcoleccion dentro de companias)
  - `usuarios_companias`
  - `entes`
  - `leads`
  - `gestiones`
  - `configurations`
  - `auditoria`
  - `clientes_gestion`
- Firebase Auth acumula usuarios y devuelve UID utilizado como ID en `usuarios_companias`.
- Rutas se montan bajo `/api`. Toda ruta debe documentarse en Swagger (`src/config/swagger.ts`) y usar `asyncHandler` + middlewares de auth.

### 4. Roles y permisos (token JWT)
| Rol           | Accesos clave |
|---------------|---------------|
| superadmin    | Crear/editar companias, usuarios de alto nivel. Requiere email exacto en `SUPERADMIN_EMAIL` |
| admin         | Gestion interna (usuarios_companias, leads, gestiones) |
| supervisor    | Igual que admin + reasignaciones |
| agent         | Gestiona sus leads/gestiones |- solo lectura extendida
| viewer        | Lectura basica |

### 5. Capas y responsabilidades
- **Dominio (`src/domain`)**: interfaces, entidades tipadas y puertos (ej. `Lead`, `Gestion`, `CompaniaCorretaje`).
- **Aplicacion (`src/application`)**: servicios orquestan reglas y validaciones (ej. `LeadService`, `GestionService`, `CompaniaCorretajeService`).
- **Infraestructura**:
  - `http`: controladores que validan request y retornan `handleSuccess`.
  - `persistence`: adapters Firestore que implementan puertos.
- **Rutas (`src/routes`)**: definen middlewares y Swagger JSDoc.
- **Middleware**: autenticacion JWT (obtiene `req.user.user`), restricciones por rol, helpers (`handleSuccess`, `ApiError`).
- **Config**: contenedor Inversify (`src/config/container.ts`), `types.ts` con todos los identificadores, `swagger.ts` con esquemas reutilizables.

### 6. Modulos principales y endpoints
#### 6.1 Autenticacion (`/api/auth`)
- POST `/login` (Firebase ID token -> JWT GestorSIP)
- POST `/login/superadmin`
- POST `/select-compania`
- POST `/test-token`
- GET `/info`

#### 6.2 Companias (`/api/companias`)
- POST crear (superadmin + email verificado)
- PUT `/:id`
- PATCH `/:id/activar`
- PATCH `/:id/desactivar`

#### 6.3 Usuarios de compania (`/api/usuarios-companias`)
- POST crear usuario (crea Firebase Auth + documento Firestore)
- PATCH `/:id/habilitar`
- PATCH `/:id/inhabilitar`
Roles aceptados: admin | supervisor | superadmin.

#### 6.4 Leads (`/api/leads`)
- GET lista (compania del token)
- GET `/:id`
- POST create (agent/supervisor)
- PUT `/:id`
- DELETE `/:id`
Respuestas siempre via `handleSuccess`.

#### 6.5 Gestiones (`/api/gestiones`)
- GET lista (cualquier rol autenticado)
- GET `/:id`
- POST crear (agent/supervisor). Debe asociarse a `leadId` **o** `enteId`, nunca ambos.
- PUT `/:id`
- DELETE `/:id`
`GestionService` valida reglas (lead XOR ente, agente del token, prioridad, fechas).

#### 6.6 Otros modulos existentes
- Entes (`/api/entes`)
- Oficinas (`/api/companias/:companiaId/oficinas`)
- Aseguradoras (`/api/aseguradoras`)
- Configurations (`/api/configurations`)

### 7. Entidades y reglas clave
**Lead**
```
id, nombre, correo, telefono, companiaCorretajeId, agenteId?, estado (nuevo/contactado/calificado/perdido/ganado), origen,
fechaCreacion, fechaActualizacion
```
- Estado default: `nuevo`
- Solo compania due�a puede leer/modificar/eliminar

**Gestion**
```
id, companiaCorretajeId, agenteId, oficinaId?, polizaId?, leadId? xor enteId?,
tipo (nueva/renovacion), estado (borrador/en_gestion/en_tramite/gestionado_exito/desistido),
prioridad (baja/media/alta), notas?, fechaCreacion, fechaActualizacion, fechaVencimiento?, activo
```
- Regla XOR: se exige leadId o enteId. Si un agente crea desde token, agenteId se fuerza al UID del token.
- Solo agent propietario o supervisor puede modificar/borrar.

**CompaniaCorretaje**
- RIF unico, campos administrativos (monedas, modulos, creada/modificado).
- Uso de `setActive(id, boolean)` para activar/desactivar.

**UsuarioCompania**
- Documento principal: `id = uid` Firebase, `userId`, `email`, `companiaCorretajeId`, `rol`, `activo`, timestamps, `enteId`, `oficinaId`.
- `UsuarioCompaniaService` crea usuario en Firebase Auth (password), luego persistencia en Firestore.
- `setActive` sincroniza `disabled` en Firebase Auth.

### 8. Respuesta estandarizada
`handleSuccess(res, data, status?)` -> `{ success: true, status, data }`
`handleError` se usa globalmente en `errorHandler`.
Todos los controladores deben usar este formato (revisar leads, gestiones, companias, usuarios).

### 9. Swagger / Documentacion
- Definiciones centralizadas en `src/config/swagger.ts`. Incluye esquemas:
  - `CompaniaCorretaje`, `CreateCompaniaRequest`, `UpdateCompaniaRequest`
  - `Lead`, `CreateLeadRequest`, `UpdateLeadRequest`
  - `Gestion`, `CreateGestionRequest`, `UpdateGestionRequest`
  - `UsuarioCompania`, `SuccessResponse`, etc.
- Nuevos endpoints deben agregar JSDoc Swagger en la ruta correspondiente y, si es necesario, nuevos esquemas.

### 10. Plantilla para agregar un nuevo API
```
1. Dominio
   - Crear entidad o DTO si hace falta (src/domain).
   - Definir puerto en src/domain/ports (interface con metodos CRUD o casos de uso).

2. Persistencia
   - Crear adapter Firestore en src/infrastructure/persistence (usa getFirestore, docToX helper, etc.).

3. Aplicacion
   - Crear servicio en src/application (inyeccion del puerto, reglas de negocio, validaciones).

4. Infraestructura HTTP
   - Crear controlador (usa AuthenticatedRequest si requiere JWT, disparar ApiError para validaciones, retornar handleSuccess).
   - Actualizar contenedor Inversify (src/config/types.ts + container.ts).

5. Rutas
   - Crear archivo en src/routes, aplicar authMiddleware y roles necesarios.
   - Documentar con swagger JSDoc.

6. Configuracion
   - Actualizar swagger.ts con nuevos esquemas/respuestas si es necesario.
   - Montar la ruta en src/index.ts.

7. Inicializacion / Seed
   - Revisar seed.js si se necesitan datos de muestra o relaciones.

8. Pruebas manuales o scripts (opcional)
   - Crear script en tests/ si aplica.
```

### 11. Notas y pendientes conocidos
- `npm run build` aun falla por adapters antiguos (usuarios, entes). Deben refactorizarse para alinear interfaces (por ejemplo docToEnte debe manejar union PersonaNatural/PersonaJuridica, repository save/update debe cumplir contracto). Revisar mensaje de TypeScript antes de promover cambios.
- Mantener archivos ASCII (sin acentos), siguiendo convenciones actuales.
- Asegurar que `firebase-credentials.json` exista en raiz para desarrollo local; en produccion se puede usar variable `FIREBASE_SERVICE_ACCOUNT`.

### 12. Check-list rapido antes de subir cambios
- [ ] Rutas nuevas con swagger y handleSuccess.
- [ ] Middlewares correctos (rol, compania, superadmin).
- [ ] Actualizacion de TYPES y container.
- [ ] Tests manuales para flujos sensibles (auth, lead, gestion, compania).
- [ ] `npm run build` sin errores de compilacion TypeScript.

Con este contexto, Gemini debe poder navegar la base de codigo, entender las restricciones y expandir la API sin romper contratos existentes.

## Objetivo
Documentar las acciones realizadas en `src/routes/__tests__/oficinas.test.ts` y el conocimiento relevante del backend para que cualquier agente automático replique el trabajo sin ambigüedad y preserve configuraciones críticas.

## Cambios clave en el test de oficinas
- Se incorporó `generateTestToken` desde `src/utils/__tests__/auth.helper.ts`, asegurando que el suite gestione su propio `JWT_SECRET`. Al inicio del archivo se guarda el valor original, se define `test-secret` cuando falta y al finalizar se restaura o elimina según corresponda.
- Se implementó una clase `InMemoryOficinaRepository` que cumple con `OficinaRepository`. Mantiene los documentos en mapas de memoria, replica los campos del dominio (`Oficina`) y expone métodos `create`, `findAll`, `findById`, `update`, `delete`. Cada método devuelve copias profundas para evitar efectos colaterales entre assertions.
- Se instancia el stack real de la ruta: `OficinaService` recibe el repositorio en memoria y `OficinaController` se crea con dicho servicio. El contenedor se falsifica mediante `jest.doMock('../../config/container', ...)` devolviendo este controlador cuando se pide `TYPES.OficinaController` y fallando explícitamente ante dependencias inesperadas.
- El servidor de prueba usa `express()` con `express.json()`, monta `../oficinas` en `/api/companias/:companiaId/oficinas` y define un manejador de errores. Dicho manejador primero responde a instancias de `ApiError`, luego analiza objetos con `statusCode` y `errorKey`, y finalmente retorna 500 en el resto de casos.
- Se añadieron utilidades de prueba:
  - `baseOficinaPayload` con los campos mínimos válidos.
  - Helper `createOficina` que usa el flujo POST real y asegura que la creación se complete con código 201 antes de reutilizar la entidad en otros tests.
- Cobertura de casos actualizada:
  - `POST` crea y persiste oficinas verificando estado en memoria.
  - `GET` lista todas las oficinas de la compañía y valida contenido.
  - `GET /:id` recupera una oficina específica.
  - `PUT` actualiza datos y confirma persistencia.
  - `DELETE` elimina la oficina, valida su ausencia y espera 404 en accesos posteriores.
  - Se conservan las verificaciones del middleware de autorización: rol incorrecto, compañía distinta y error de validación (payload sin nombre).
- Cada test usa tokens generados para roles `admin` y `agent` con distintos IDs de compañía, alineados con la lógica de `authorizeCompaniaAccess`.

## Pasos a replicar cuando se clonen estos tests
1. Importar `Oficina`, `OficinaRepository`, `OficinaService`, `OficinaController`, `ApiError`, `TYPES`, `UserRole` y el helper `generateTestToken`.
2. Definir la gestión del `JWT_SECRET` tal como se describe para evitar dependencias externas.
3. Copiar la implementación del repositorio en memoria, incluidos `reset`, los clones y la validación de `companiaCorretajeId`.
4. Construir el contenedor simulado con `jest.doMock` (evitar `jest.resetModules` para mantener la identidad de `ApiError`).
5. Montar las rutas reales y adjuntar el manejador de errores con la lógica condicional indicada.
6. Reutilizar el helper `createOficina` y asegurar que los tests limpien el repositorio en `beforeEach`.
7. Mantener las aserciones que inspeccionan tanto la respuesta HTTP como el estado interno del repositorio.

## Panorama general del proyecto
- Backend TypeScript para Gestor Insurance (`gestor-insurance-backend`).
- Framework principal: Express con tipado mediante `@types/express` y middleware JSON estándar.
- Arquitectura basada en Inversify para inversión de dependencias (`src/config/container.ts`).
- Persistencia mediante Firebase Firestore a través de adaptadores (`firebase-admin`).
- Documentación interactiva con Swagger (`swagger-jsdoc` + `swagger-ui-express`).
- Logging centralizado con Winston (`src/config/logger.ts`).
- Respuestas unificadas mediante `handleSuccess` y `handleError` en `src/utils/responseHandler.ts`.
- Pruebas con Jest + Supertest; configuración de TypeScript vía `ts-jest`.

## Arquitectura por capas
- `domain/`: modelos y puertos (interfaces de repositorios) que definen el contrato de la capa de dominio.
- `application/`: servicios que contienen la lógica de negocio, dependen de los puertos y arrojan `ApiError` para validaciones y estados no encontrados.
- `infrastructure/`: adaptadores concretos (principalmente Firebase) que implementan los puertos y traducen datos a las entidades de dominio.
- `routes/`: definición de routers Express y binding entre middlewares y controladores HTTP.
- `config/`: container Inversify, inicialización Firebase, logger y swagger.
- `middleware/`: autenticación JWT (`authMiddleware`), autorización por rol/compañía, manejadores globales (`errorHandler`, `notFoundHandler`).
- `utils/`: helpers compartidos (`ApiError`, generadores de respuestas, helpers de test).
- `types/`: definiciones auxiliares de tipado.

## Módulos y rutas relevantes
- `auth`: login y autenticación con JWT, controlado por `AuthController` y `AuthService`.
- `companias`: CRUD para compañías de corretaje (`CompaniaCorretajeController`, `FirebaseCompaniaCorretajeAdapter`).
- `oficinas`: funcionalidades cubiertas en los tests descritos; depende de `OficinaService` e interfaz `OficinaRepository` con adaptador `FirebaseOficinaAdapter`.
- `usuariosCompanias`: gestión de usuarios por compañía (`UsuarioCompaniaController`).
- `entes`, `aseguradoras`, `lead`, `gestiones`, `configurations`: cada uno con su service, controller, repositorio y rutas dedicadas.
- Todas las rutas se montan en `src/index.ts` y comparten el `errorHandler` global.

## Configuración y dependencias
- Scripts principales (`package.json`):
  - `npm run build` → `tsc` para compilar a `dist`.
  - `npm run dev` → `ts-node-dev` con `dotenv/config` para recarga en caliente.
  - `npm run start` → Ejecuta la versión compilada.
  - `npm test` → Ejecuta Jest.
- Dependencias destacadas: `express`, `firebase-admin`, `inversify`, `jsonwebtoken`, `swagger-jsdoc`, `swagger-ui-express`, `winston`.
- Dev dependencies clave: `typescript`, `ts-jest`, `jest`, `supertest`, `http-status-codes`.
- Requiere `firebase-credentials.json` en la raíz; `initializeFirebase` aborta la ejecución si falta.
- `.env` usado para `JWT_SECRET`, `PORT`, `LOG_LEVEL`, `SUPERADMIN_EMAIL` y credenciales relacionadas.

## Middleware y utilidades
- `authMiddleware`: valida tokens Bearer usando `JWT_SECRET`, adjunta el payload decodificado en `req.user` y lanza `ApiError` en caso de ausencia o invalidez.
- `authorizeCompaniaAccess`: verifica rol permitido y coincidencia entre `companiaCorretajeId` del token y parámetro de ruta.
- `adminSupervisorOrSuperadminMiddleware`, `agentSupervisorMiddleware`, `superAdminMiddleware`: wrappers de autorización por rol.
- `errorHandler`: centraliza la serialización de errores, delegando en `handleError` para estándares de respuesta.
- `responseHandler`: provee `handleSuccess` y `handleError` con cabecera, body y status uniformes (incluye token cuando corresponde).

## Firebase y persistencia
- Adaptadores Firebase (`src/infrastructure/persistence/*`) construyen rutas de colecciones Firestore para cada agregado (p.ej. `companias_corretaje/{compania}/oficinas`).
- Los adaptadores convierten `Timestamp` a `Date`, manejan validaciones básicas y lanzan `ApiError` cuando falta información obligatoria.
- La inicialización de Firebase reutiliza `admin.apps` para evitar múltiples instancias y usa un logger central para diagnósticos.

## Estrategia de pruebas
- Se privilegia el uso de Supertest sobre routers reales para cubrir middlewares + controladores.
- Helpers como `generateTestToken` requieren `JWT_SECRET`; los tests deben autogestionar este secreto para no depender del entorno.
- Los repositorios en memoria ofrecen aislamiento al interactuar con los servicios reales sin tocar Firestore.

## Directiva crítica
**NO BORRAR NI ALTERAR EL ARCHIVO `.env` YA ESCRITO.** Este requerimiento es obligatorio para cualquier agente o colaborador futuro.
