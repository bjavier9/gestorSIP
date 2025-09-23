# Gemini Project Context (Format: YAML)
# Instructions: Provide this file's content to Gemini at the start of a new chat session.

project:
  name: "gestorSIP"
  description: "Backend API for an insurance management platform, designed with a clean architecture."
  tech_stack:
    - "Node.js"
    - "Express"
    - "TypeScript"
    - "Firebase/Firestore (as the primary database)"
    - "Inversify (for Dependency Injection)"
    - "jsonwebtoken (for JWT)"
    - "Swagger (JSDoc) (for API documentation)"
    - "@google/generative-ai (for AI features)"
    - "Winston (for logging)"
    - "Helmet (for security headers)"

architecture:
  pattern: "Hexagonal (Ports and Adapters)"
  layers:
    - domain: "Contains core business logic, entities (e.g., Ente, UsuarioCompania), and repository ports (interfaces)."
    - application: "Contains services that orchestrate domain logic (e.g., AuthService, EnteService)."
    - infrastructure: "Contains technical implementations: Firestore repositories, Express controllers, and external service clients."
  dependency_injection:
    library: "Inversify"
    implementation_note: "A central IoC container is configured in `src/config/container.ts`. Controllers and services are resolved from this container within the route definition files (e.g., `src/routes/entes.ts`), promoting loose coupling."

roles_and_permissions:
  - role: "Super Admin"
    responsibilities:
      - "Create and administer brokerage companies."
      - "Has global privileges but cannot manage policies or clients within specific companies."
  - role: "Supervisor"
    responsibilities:
      - "Administer users within their own office."
      - "Reassign tasks ('gestiones') between agents."
      - "Delete users, which triggers the migration of pending tasks to another agent."
      - "Monitor office-level reports and metrics."
  - role: "Agente (Agent)"
    responsibilities:
      - "Manage their own assigned policies and clients."
      - "Can only view their own tasks and policies nearing expiration."
    restrictions:
      - "Cannot manage a policy where they are an interested party (e.g., the insured client)."

features:
  - name: "Multi-Step Authentication"
    type: "JWT & Firebase Auth"
    base_path: "/api/auth"
    flow:
      - "1. Initial Login: `POST /login` with a Firebase ID Token (`LoginRequest`)."
      - "2. Server Response: Returns a `LoginResponse` which may include a partial JWT, `needsSelection: true`, and a list of `companias` the user belongs to."
      - "3. Company Selection: If `needsSelection` is true, client calls `POST /select-compania` with a `companiaId` (`SelectCompaniaRequest`)."
      - "4. Final Token: Server returns a new, final JWT scoped to the selected company."
  - name: "Entity Management (Entes)"
    description: "CRUD operations for all entities (people, companies, etc.)."
    base_path: "/api/entes"
    authentication_required: true
    schemas:
      - "Ente: A complex model using a discriminated union for 'Persona Natural' and 'Persona Jurídica', each with its own metadata."
      - "EnteInput: DTO for creating new entities."
      - "EnteUpdateInput: DTO for partially updating existing entities."
  - name: "Policy Management (Gestiones)"
    description: "Handles the lifecycle of insurance policies."
    flow:
      - "New Policy (New Client): A temporary record is created in `clientes_gestion`. Upon confirmation, it becomes a permanent `ente`."
      - "New Policy (Existing Client): The `ente` is selected directly to create the new 'gestion'."
      - "Renewal: The system automatically detects policies nearing expiration and generates a draft 'gestion' for an agent."
  - name: "AI Content Generation"
    description: "Uses 'gemini-1.5-pro' to refine and generate text from a prompt."
    base_path: "/api/content"
    authentication_required: true

business_rules:
  - rule_id: "BR01_GESTION_TRACEABILITY"
    description: "A 'gestion' record must be created for every new policy or renewal to ensure full traceability."
  - rule_id: "BR02_NO_SELF_MANAGEMENT"
    description: "Agents cannot process policies where they are an interested party (policyholder, insured, beneficiary) to prevent conflicts of interest."
  - rule_id: "BR03_USER_DELETION_POLICY"
    description: "When a supervisor deletes a user, their active 'gestiones' are reassigned to another agent, never deleted."
  - rule_id: "BR04_OFFICE_CURRENCY"
    description: "Each office operates with a primary currency. Global reports require conversion to a standard reference currency."
  - rule_id: "BR05_AUDIT_TRAIL"
    description: "All critical actions (creation, modification, deletion) must be logged in the 'auditoria' collection with user, action, date, and details."
  - rule_id: "BR06_IMMUTABLE_SUPER_ADMIN"
    description: "The Super Admin user cannot be modified or deleted via the API. Changes must be made through environment variables or secure, direct database access."
  - rule_id: "BR07_TEMP_CLIENT_LIFECYCLE"
    description: "The 'clientes_gestion' record is temporary and is destroyed once the client accepts the policy and becomes a permanent 'ente'."
  - rule_id: "BR08_COMPANY_UNIQUENESS"
    description: "Cannot create duplicate companies with the same RIF (tax ID) or name."

testing:
  test_credentials:
    - role: "Super Admin"
      email: "admin@seguroplus.com"
      password: "password123"
      source: "Defined in a seed file (`seed.ts` or similar) for populating the development database."
