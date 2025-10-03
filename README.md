# GestorSIP Backend

GestorSIP es el backend de una plataforma de corretaje de seguros. Expone una API REST construida con Node.js, Express y TypeScript siguiendo una arquitectura hexagonal. El sistema se integra con Firebase Admin para manejar autenticacion y persistencia en Firestore, aplicando reglas de acceso por rol.

---

## Caracteristicas Clave
- Arquitectura **Hexagonal (Puertos y Adaptadores)** para separar logica de dominio e infraestructura.
- **TypeScript + InversifyJS** para tipado estricto e inyeccion de dependencias.
- **Firebase Admin SDK** para autenticacion y acceso a Firestore.
- **Control de accesos por rol** implementado en middleware (`superadmin`, `admin`, `supervisor`, `agent`, `viewer`).
- **Respuestas consistentes** mediante los helpers `handleSuccess` y `handleError`.
- **Documentacion OpenAPI/Swagger** generada automaticamente (`/api-docs`).
- **Cobertura de dominio amplia** para companias, oficinas, usuarios-compania, leads, gestiones, entes, aseguradoras, configuraciones, entre otros.

---

## Stack Tecnico
| Capa          | Herramientas |
|---------------|--------------|
| Lenguaje      | TypeScript (strict) |
| Runtime       | Node.js 18+ |
| Framework     | Express.js |
| Contenedor DI | InversifyJS |
| Base de datos | Cloud Firestore (Firebase Admin) |
| Autenticacion | Firebase Authentication (email/password, custom JWT) |
| Documentacion | Swagger UI + swagger-jsdoc |
| Logging       | Winston |

---

## Estructura del Proyecto
```
src/
  application/        # Casos de uso / servicios
  config/             # Container de Inversify, tipos, firebase, swagger
  domain/             # Entidades, value objects, puertos
  infrastructure/
    http/             # Controladores Express (adaptadores)
    persistence/      # Adaptadores Firestore
  middleware/         # JWT, roles, errores
  routes/             # Routers Express con anotaciones Swagger
  services/           # Servicios compartidos
  utils/              # ApiError, response handler, helpers
index.ts              # Bootstrap de la app
```

---

## Aspectos del Dominio
### Roles
- **superadmin**: gestiona companias de corretaje, requiere correo configurado en `SUPERADMIN_EMAIL`.
- **admin / supervisor**: administran recursos internos (usuarios, leads, gestiones).
- **agent**: maneja leads/gestiones asignadas.
- **viewer**: acceso de solo lectura.

### Entidades
- **CompaniaCorretaje**: corretaje con oficinas, monedas y modulos. Solo superadmin puede crear, actualizar, activar o desactivar.
- **UsuarioCompania**: asociacion de un usuario Firebase con una compania. El documento usa `id = uid`.
- **Lead**: prospecto vinculado a una compania (y opcionalmente a un agente). CRUD restringido a agent/supervisor.
- **Gestion**: ciclo de trabajo sobre una poliza (nueva o renovacion). Debe vincularse a un lead o ente. Solo el agente propietario o un supervisor puede modificar.
- **Ente**: cliente aprobado (persona natural o juridica).

---

## Convencion de Respuestas
Todos los controladores deben responder con `handleSuccess(res, data, status)` y `handleError`, obteniendo estructuras como:
```
{
  "success": true,
  "status": 200,
  "data": { ... }
}
```
Los errores usan `ApiError` para mantener codigos y mensajes consistentes.

---

## Variables de Entorno
| Variable | Obligatoria | Descripcion |
|----------|-------------|-------------|
| `PORT` | Opcional | Puerto HTTP (por defecto `3000`). |
| `JWT_SECRET` | Obligatoria | Clave para firmar los JWT de la aplicacion. |
| `JWT_EXPIRES_IN` | Opcional | Validez del JWT (ej. `24h`). |
| `FIREBASE_PROJECT_ID` | Obligatoria | Identificador del proyecto Firebase. |
| `SUPERADMIN_EMAIL` | Obligatoria | Correo autorizado como superadmin. |
| `SUPERADMIN_PASSWORD` | Obligatoria | Clave para el endpoint de login superadmin. |
| `TEST_SECRET` | Opcional | Secreto usado por `/api/auth/test-token`. |
| `FIREBASE_SERVICE_ACCOUNT` | Opcional | JSON (una sola linea) con credenciales de servicio (para despliegues). |

> En desarrollo se espera el archivo `firebase-credentials.json` en la raiz (ignorando por git). En produccion puede usarse `FIREBASE_SERVICE_ACCOUNT`.

---

## Puesta en Marcha
1. **Instalar requisitos**
   - Node.js 18+
   - npm 9+

2. **Clonar e instalar**
   ```bash
   git clone <repo>
   cd gestorSIP
   npm install
   ```

3. **Configurar Firebase**
   - Descarga las credenciales de servicio desde Firebase Console.
   - Guarda el JSON como `firebase-credentials.json` en la raiz del proyecto.

4. **Crear `.env`** (ejemplo)
   ```env
   PORT=3000
   JWT_SECRET=define_un_secreto_seguro
   SUPERADMIN_EMAIL=superadmin@gestorinsurance.com
   SUPERADMIN_PASSWORD=SuperSecretPassword123!
   TEST_SECRET=super_dev_secret
   ```

5. **Sembrar datos (opcional)**
   - Provee `temp-firebase-credentials.json` para el script de seed.
   - Ejecuta `node seed.js` para poblar Firestore.

6. **Ejecucion en desarrollo**
   ```bash
   npm run dev
   # servidor: http://localhost:3000
   # swagger: http://localhost:3000/api-docs
   ```

7. **Construccion para produccion**
   ```bash
   npm run build
   npm start
   ```

> Si ves `Firestore no ha sido inicializado`, revisa que el archivo `firebase-credentials.json` exista o que las variables de servicio esten definidas.

---

## Resumen de API
| Area | Ruta base | Roles |
|------|-----------|-------|
| Auth | `/api/auth` | depende del endpoint (login abierto, resto con JWT) |
| Companias | `/api/companias` | solo superadmin |
| Oficinas | `/api/companias/:companiaId/oficinas` | admin o supervisor segun accion |
| Usuarios-Companias | `/api/usuarios-companias` | admin, supervisor o superadmin |
| Leads | `/api/leads` | agent y supervisor para mutaciones; todos los roles de la compania para lectura |
| Gestiones | `/api/gestiones` | agent/supervisor para mutaciones; cualquier usuario de la compania para lectura |
| Entes | `/api/entes` | usuarios autenticados de la compania |
| Aseguradoras | `/api/aseguradoras` | usuarios autenticados |
| Configurations | `/api/configurations` | autenticados (mutaciones solo superadmin) |

Swagger contiene esquemas detallados (`Lead`, `Gestion`, `CompaniaCorretaje`, `UsuarioCompania`, etc.).

---

## Guia de Desarrollo
- Utiliza archivos ASCII para evitar problemas de encoding.
- Documenta las rutas con Swagger JSDoc en `src/routes/*`.
- Los controladores deben responder con `handleSuccess`/`handleError`.
- Middleware relevantes:
  - `authMiddleware`: valida JWT y adjunta `req.user`.
  - `superAdminMiddleware`: verifica correo/rol de superadmin.
  - `adminSupervisorOrSuperadminMiddleware`: controla acciones de usuarios-compania.
  - `agentSupervisorMiddleware`: protege leads y gestiones.
- Actualiza `src/config/types.ts` y `src/config/container.ts` cuando agregues servicios/controladores/adaptadores.
- Compila con TypeScript (`npm run build`) como verificacion principal. Los scripts E2E viven en `tests/`.

---

## Problemas Frecuentes
| Sintoma | Solucion |
|---------|----------|
| `Firestore no ha sido inicializado` | Verifica credenciales de Firebase antes de iniciar el servidor. |
| `Unauthorized` en rutas de superadmin | Confirma que el correo del JWT coincide con `SUPERADMIN_EMAIL`. |
| Errores de TypeScript en adaptadores | Alinea interfaces de repositorio con las implementaciones (`findById`, `update`, etc.). |
| Swagger no muestra un endpoint nuevo | Asegurate de agregar JSDoc en la ruta y reinicia el servidor. |

---

## Como agregar una nueva API
1. Define entidades y puertos (`src/domain`).
2. Implementa el adaptador Firestore en `src/infrastructure/persistence`.
3. Crea el servicio con reglas de negocio en `src/application`.
4. Construye el controlador en `src/infrastructure/http` usando `handleSuccess`.
5. Registra tipos y bindings en `src/config/types.ts` y `src/config/container.ts`.
6. Agrega la ruta en `src/routes`, protege con middleware y documenta con Swagger.
7. Monta la ruta en `src/index.ts`.
8. Actualiza documentacion (README, wiki) y scripts de prueba si aplica.

---

## Recursos Adicionales
- `CONTEXTO_GEMINI.md`: directrices arquitectonicas resumidas.
- `/wiki/*`: manuales internos y flujos.
- `seed.js`: dataset de ejemplo (companias, oficinas, leads, gestiones, usuarios, etc.).
