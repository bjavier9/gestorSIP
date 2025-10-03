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
- Solo compania dueña puede leer/modificar/eliminar

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
