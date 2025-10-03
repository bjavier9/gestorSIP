# GestorSIP Backend

GestorSIP is the backend for an insurance brokerage platform. It exposes a REST API built with Node.js, Express, and TypeScript following a hexagonal architecture. The system integrates with Firebase Admin to handle authentication and Firestore persistence, enforcing strict access rules based on user roles.

---

## Key Features
- **Hexagonal Architecture** (Ports and Adapters) for clear separation between domain logic and infrastructure.
- **TypeScript + InversifyJS** for type-safe development and dependency injection.
- **Firebase Admin SDK** for authentication (email/password) and Firestore access.
- **Role-based Access Control** baked into middleware (`superadmin`, `admin`, `supervisor`, `agent`, `viewer`).
- **Consistent API Responses** using `handleSuccess`/`handleError` wrappers.
- **OpenAPI/Swagger Docs** automatically generated from route annotations (`/api-docs`).
- **Comprehensive Domain Support** for companies, offices, user-company associations, leads, gestiones, entes, aseguradoras, configurations, etc.

---

## Tech Stack
| Layer        | Tooling |
|--------------|---------|
| Language     | TypeScript (strict) |
| Runtime      | Node.js 18+ |
| Framework    | Express.js |
| DI Container | InversifyJS |
| Database     | Cloud Firestore (Firebase Admin) |
| Auth         | Firebase Authentication (email/password, custom JWT) |
| Docs         | Swagger UI + swagger-jsdoc |
| Logging      | Winston |

---

## Project Layout
```
src/
  application/        # Use cases / services (business orchestration)
  config/             # Inversify container, types, firebase, swagger
  domain/             # Entities, value objects, ports (interfaces)
  infrastructure/
    http/             # Express controllers (adapters)
    persistence/      # Firestore adapters implementing ports
  middleware/         # JWT auth, role checks, error handling
  routes/             # Express routers with swagger annotations
  services/           # Misc shared services (e.g. content service)
  utils/              # ApiError, response handler, helpers
index.ts              # App bootstrap (initializes Firebase, mounts routes)
```

---

## Domain Highlights
### Roles
- **superadmin**: manages brokerage companies, requires email configured in `SUPERADMIN_EMAIL`.
- **admin / supervisor**: manage internal resources (users, leads, gestiones).
- **agent**: handles assigned leads/gestiones.
- **viewer**: read-only endpoints.

### Entities
- **CompaniaCorretaje**: brokerage with offices, currencies, modules. Only superadmin can create/update/activate/deactivate.
- **UsuarioCompania**: association of a Firebase Auth user with a company. Stored with `id = uid`.
- **Lead**: prospect linked to a company (and optionally agent). CRUD restricted to agent/supervisor.
- **Gestion**: lifecycle of a policy action (new/renewal). Must be linked to either a lead or an ente (exclusive). Only agent owner or supervisor can modify.
- **Ente**: approved client (natural or legal person).

---

## Response Convention
All controllers must respond through `handleSuccess(res, data, status)` and `handleError`, yielding:
```
{
  "success": true,
  "status": 200,
  "data": { ... }
}
```
Errors use `ApiError` for consistent keys and HTTP codes.

---

## Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Optional | HTTP port (default `3000`). |
| `JWT_SECRET` | Required | Secret used to sign application JWTs. |
| `JWT_EXPIRES_IN` | Optional | JWT expiration (e.g. `24h`). |
| `FIREBASE_PROJECT_ID` | Required | Firebase project identifier. |
| `SUPERADMIN_EMAIL` | Required | Email allowed to act as superadmin. |
| `SUPERADMIN_PASSWORD` | Required | Password for superadmin login endpoint. |
| `TEST_SECRET` | Optional | Secret used by `/api/auth/test-token`. |
| `FIREBASE_SERVICE_ACCOUNT` | Optional | JSON (single line) with service account credentials (use in deployments). |

> Development expects a `firebase-credentials.json` file at project root (ignored by git). Production can set `FIREBASE_SERVICE_ACCOUNT` instead.

---

## Getting Started
1. **Install prerequisites**
   - Node.js 18+
   - npm 9+

2. **Clone and install**
   ```bash
   git clone <repo>
   cd gestorSIP
   npm install
   ```

3. **Configure Firebase credentials**
   - Download service account JSON from Firebase Console.
   - Save as `firebase-credentials.json` in the project root.

4. **Create `.env`** (example)
   ```env
   PORT=3000
   JWT_SECRET=please_set_a_secure_secret
   SUPERADMIN_EMAIL=superadmin@gestorinsurance.com
   SUPERADMIN_PASSWORD=SuperSecretPassword123!
   TEST_SECRET=super_dev_secret
   ```

5. **Seed data (optional)**
   - Provide `temp-firebase-credentials.json` (service account) for the seeding script.
   - Run `node seed.js` to populate Firestore.

6. **Run in development**
   ```bash
   npm run dev
   # server: http://localhost:3000
   # swagger: http://localhost:3000/api-docs
   ```

7. **Build for production**
   ```bash
   npm run build
   npm start
   ```

> If you see `Firestore no ha sido inicializado`, verify `firebase-credentials.json` exists or service account variables are set before running the server.

---

## API Summary
| Area | Base Path | Roles |
|------|-----------|-------|
| Auth | `/api/auth` | varies (login open, others require JWT) |
| Companias | `/api/companias` | superadmin (email must match `SUPERADMIN_EMAIL`) |
| Oficinas | `/api/companias/:companiaId/oficinas` | supervisor/admin/agent depending on action |
| Usuarios-Companias | `/api/usuarios-companias` | admin/supervisor/superadmin |
| Leads | `/api/leads` | agent & supervisor (create/update/delete), all company roles for read |
| Gestiones | `/api/gestiones` | agent/supervisor for mutations, any company user for read |
| Entes | `/api/entes` | authenticated company users |
| Aseguradoras | `/api/aseguradoras` | authenticated |
| Configurations | `/api/configurations` | authenticated |

Swagger has detailed schemas: `Lead`, `Gestion`, `CompaniaCorretaje`, `UsuarioCompania`, etc.

---

## Development Guidelines
- **Use ASCII** files to avoid encoding issues.
- **Document routes** with Swagger JSDoc comments in `src/routes/*`.
- **All controllers** must use `handleSuccess`/`handleError` wrappers.
- **Middleware**:
  - `authMiddleware` verifies JWT and populates `req.user`.
  - `superAdminMiddleware` enforces role/email checks.
  - `adminSupervisorOrSuperadminMiddleware` handles user-compania actions.
  - `agentSupervisorMiddleware` handles leads/gestiones.
- **Dependency Injection**: update `src/config/types.ts` and `src/config/container.ts` when adding services/controllers/adapters.
- **Testing**: TypeScript compilation (`npm run build`) is the primary check. Additional E2E scripts live under `tests/` (e.g. `tests/companiaCorretaje.test.js`).

---

## Common Issues
| Symptom | Fix |
|---------|-----|
| `Firestore no ha sido inicializado` | Ensure Firebase credentials are loaded before starting the app. |
| `Unauthorized` on superadmin routes | Confirm email in JWT equals `SUPERADMIN_EMAIL`. |
| TypeScript build errors in adapters | Align repository interfaces with adapter implementations (`findById`, `update`, etc.). |
| Swagger missing new endpoint | Add JSDoc in the route file and regenerate by restarting the dev server. |

---

## Adding a New API
1. Define domain entities and ports (`src/domain`).
2. Implement Firestore adapter in `src/infrastructure/persistence`.
3. Create service with business rules in `src/application`.
4. Build controller in `src/infrastructure/http` and wire responses with `handleSuccess`.
5. Register types+bindings in `src/config/types.ts` and `src/config/container.ts`.
6. Add route under `src/routes`, secure with proper middleware, and document with Swagger.
7. Mount route in `src/index.ts`.
8. Update documentation (README, CONTEXTO_GEMINI.md, wiki if needed).

---

## Additional Resources
- `CONTEXTO_GEMINI.md`: condensed architectural directives for LLM-based tooling.
- `/wiki/*`: internal playbooks and flow descriptions.
- `seed.js`: sample Firestore dataset (companias, oficinas, leads, gestiones, usuarios, etc.).

---

## License / Contributing
This repository is private. Follow the existing coding standards, pass TypeScript checks before pushing, and document any new endpoints. For larger changes, update the wiki with architecture decisions.

