
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
