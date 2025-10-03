
project_architecture:
  framework: "Node.js with Express"
  language: "TypeScript"
  design_pattern: "Hexagonal Architecture (Ports and Adapters)"
  di_container: "InversifyJS"
  database: "Cloud Firestore"
  authentication: "Firebase Authentication with custom JWTs"

critical_directives:
  - directive_id: "FIREBASE_CONFIG_LOCK"
    description: "CRITICAL: Do NOT modify the file `src/config/firebase.ts`. It contains the definitive, working Firebase initialization logic that loads credentials directly from `firebase-credentials.json`. Any changes could break the connection to the database. Do not propose using environment variables or other methods for this file."
  - directive_id: "SUPERADMIN_ENFORCEMENT"
    description: "Company management endpoints are restricted. Only tokens with role 'superadmin' AND email equal to env `SUPERADMIN_EMAIL` may create or modify companies. Do not remove or weaken this check in middleware."
  - directive_id: "CONTENT_API_REMOVED"
    description: "The `/api/content` routes were removed. Do not reintroduce this API unless explicitly requested."

key_directories:
  - path: "src/domain"
    description: "Core business logic, entities, and repository interfaces (ports)."
  - path: "src/application"
    description: "Orchestration services that implement the use cases."
  - path: "src/infrastructure"
    description: "Concrete implementations of ports (e.g., Firestore adapters) and external-facing code (Express controllers)."
  - path: "src/config"
    description: "Configuration for InversifyJS container, Firebase, etc."
  - path: "src/routes"
    description: "API route definitions."
  - path: "src/index.ts"
    description: "Main application entry point. Handles async initialization and module loading."

business_rules:
  - rule_id: "BR07_CLIENT_PROMOTION"
    description: "The 'clientes_gestion' record is temporary and is destroyed once the client accepts the policy and becomes a permanent 'ente'."
  - rule_id: "BR08_COMPANY_UNIQUENESS"
    description: "Cannot create duplicate companies with the same RIF (tax ID) or name."
  - rule_id: "BR09_USER_COMPANIA_ROLES"
    description: "Only users with roles admin, supervisor, or superadmin can create or toggle estado (activo) of `usuarios_companias`."

testing:
  test_credentials:
    - role: "Super Admin"
      email: "admin@seguroplus.com"
      password: "password123"
      source: "Defined in a seed file (`seed.ts` or similar) for populating the development database."

development_playbooks:
  - playbook_id: "ADD_NEW_ENDPOINT"
    description: "A step-by-step guide for creating a new API endpoint following the project's Hexagonal Architecture with InversifyJS."
    steps:
      - step: 1
        component: "Domain"
        description: "Define the core business concepts."
        tasks:
          - "Define the entity class or interface in `src/domain/<entity>.ts`. This represents the complete data structure of the business object."
          - "Define the repository port (interface) in `src/domain/ports/<entity>Repository.port.ts`. This defines the contract for persistence operations (e.g., `create`, `findById`)."

      - step: 2
        component: "DTOs & Types"
        description: "Define the specific data shapes for API communication."
        tasks:
          - "Create a DTO (Data Transfer Object) file, e.g., `src/domain/dtos/<entity>.dto.ts`."
          - "Inside this file, define interfaces for request bodies (e.g., `Create<Entity>Dto`, `Update<Entity>Dto`) and responses. This decouples the API layer from the internal domain model."

      - step: 3
        component: "Application"
        description: "Implement the use case logic."
        tasks:
          - "Create the service class in `src/application/<entity>.service.ts`. This class will use the DTOs for its input and output, and call repository methods via the port interface."

      - step: 4
        component: "Infrastructure"
        description: "Implement technology-specific details."
        tasks:
          - "Create the repository adapter in `src/infrastructure/persistence/firebase<Entity>.adapter.ts`. This class implements the repository port for Firestore."
          - "Create the controller in `src/infrastructure/http/<entity>.controller.ts`. This class handles HTTP requests, validates the request body against the DTO, and calls the application service."

      - step: 5
        component: "Configuration (DI & Routing)"
        description: "Wire everything together."
        tasks:
          - "In `src/config/container.ts`, bind the repository interface to its adapter implementation, and bind the service and controller."
          - "Create a new router file in `src/routes/<entity>.ts`. Define the Express route, get the controller from the container, and link them."
          - "In `src/index.ts`, inside the `startServer` function, dynamically import the new router file and mount it with `app.use()`."

      - step: 6
        component: "Finalization"
        description: "Update API documentation and validate."
        tasks:
          - "Ensure the controller and routes have appropriate JSDoc/Swagger comments so the new endpoint appears correctly in `/api-docs`."
          - "Run tests and validate the new endpoint's behavior."

  - playbook_id: "MANAGE_USUARIOS_COMPANIAS"
    description: "Create and manage user-company associations ensuring Firebase Auth sync and role restrictions."
    steps:
      - step: 1
        component: "Application"
        description: "Create service to orchestrate Firebase Auth user creation and Firestore write."
        tasks:
          - "Use `getAuth().createUser()` to create the auth user (email, password)."
          - "Persist a document in `usuarios_companias` with `id = uid` and fields: userId, email, companiaCorretajeId, rol, activo, fechaCreacion." 
      - step: 2
        component: "Infrastructure"
        description: "HTTP controller + repository adapter."
        tasks:
          - "Controller validates body and calls service."
          - "Repository adapter writes to `usuarios_companias` (id equals Firebase uid)."
          - "Implement `setActive(id, active)` to toggle `activo` and mirror to Firebase Auth (disabled flag)."
      - step: 3
        component: "Security"
        description: "Restrict endpoints to roles admin, supervisor, or superadmin."
        tasks:
          - "Use `adminSupervisorOrSuperadminMiddleware` for `/api/usuarios-companias` routes."
      - step: 4
        component: "Swagger"
        description: "Document POST create and PATCH habilitar/inhabilitar with examples."

api_endpoints:
  companias:
    - method: POST
      path: "/api/companias"
      auth: "Bearer JWT (superadmin only; email must equal SUPERADMIN_EMAIL)"
      request_schema: "CreateCompaniaRequest"
      response: "{ success, status: 201, data: CompaniaCorretaje }"
    - method: PUT
      path: "/api/companias/{id}"
      auth: "Bearer JWT (superadmin only; email must equal SUPERADMIN_EMAIL)"
      request_schema: "UpdateCompaniaRequest (partial)"
      response: "{ success, status: 200, data: CompaniaCorretaje }"
    - method: PATCH
      path: "/api/companias/{id}/activar"
      auth: "Bearer JWT (superadmin only; email must equal SUPERADMIN_EMAIL)"
      response: "{ success, status: 200, data: CompaniaCorretaje }"
    - method: PATCH
      path: "/api/companias/{id}/desactivar"
      auth: "Bearer JWT (superadmin only; email must equal SUPERADMIN_EMAIL)"
      response: "{ success, status: 200, data: CompaniaCorretaje }"

  usuarios_companias:
    - method: POST
      path: "/api/usuarios-companias"
      auth: "Bearer JWT (roles: admin|supervisor|superadmin)"
      description: "Creates Firebase Auth user and Firestore doc with same uid."
      request_body: "{ email, password, companiaCorretajeId, rol, [enteId], [oficinaId] }"
      response: "{ success, status: 201, data: UsuarioCompania }"
    - method: PATCH
      path: "/api/usuarios-companias/{id}/habilitar"
      auth: "Bearer JWT (roles: admin|supervisor|superadmin)"
      response: "{ success, status: 200, data: UsuarioCompania }"
    - method: PATCH
      path: "/api/usuarios-companias/{id}/inhabilitar"
      auth: "Bearer JWT (roles: admin|supervisor|superadmin)"
      response: "{ success, status: 200, data: UsuarioCompania }"

implementation_notes:
  - "Super Admin login now validates against env `SUPERADMIN_EMAIL` and `SUPERADMIN_PASSWORD` (no correo duro)."
  - "`/api/content` removed from `src/index.ts`."
  - "`UsuarioCompaniaService` coordinates Firebase Auth creation and Firestore persistence (id = uid)."
  - "`superAdminMiddleware` exige rol 'superadmin' y email igual a `SUPERADMIN_EMAIL`."
  - "`adminSupervisorOrSuperadminMiddleware` restringe creación/activación de usuarios_companias a roles admin/supervisor/superadmin."
  - "Normalización de `Ente`: se convirtieron `Timestamp` a `Date` y se unificaron campos de fecha a camelCase en el adapter."
