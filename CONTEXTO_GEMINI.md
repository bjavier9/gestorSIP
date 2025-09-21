# Gemini Project Context (Format: YAML)
# Instructions: Provide this file's content to Gemini at the start of a new chat session.

project:
  name: "gestorSIP"
  description: "Backend API for an insurance management platform."
  tech_stack:
    - "Node.js"
    - "Express"
    - "TypeScript"
    - "Firebase/Firestore"
    - "Inversify (for Dependency Injection)"
    - "jsonwebtoken (for JWT)"
    - "bcryptjs (for hashing)"
    - "Winston (for logging)"
    - "Helmet (for security headers)"
    - "Swagger (for API documentation)"
    - "@google/generative-ai (for AI features)"
  architecture:
    pattern: "Hexagonal (Ports and Adapters)"
    layers:
      - domain: "Contains business logic, entities, and repository ports (interfaces)."
      - application: "Contains services that orchestrate the domain logic."
      - infrastructure: "Contains technical implementations like database adapters and HTTP controllers."
    dependency_injection:
      library: "Inversify"
      implementation_note: "Dependencies (repositories, services, controllers) are instantiated manually in `src/app.ts` rather than through an Inversify container. This provides a clear, albeit manual, dependency graph."

middlewares:
  - name: "helmet"
    purpose: "Sets various security-related HTTP headers to protect against common vulnerabilities."
  - name: "cors"
    purpose: "Enables Cross-Origin Resource Sharing."
  - name: "compression"
    purpose: "Compresses response bodies for better performance."
  - name: "express.json"
    purpose: "Parses incoming requests with JSON payloads."
  - name: "requestLogger"
    purpose: "Custom middleware (likely using Morgan or Winston) to log incoming HTTP requests."
  - name: "errorHandler"
    purpose: "Centralized middleware to catch and handle all application errors, preventing crashes."

features:
  - name: "Authentication"
    type: "JWT"
    base_path: "/api/auth"
    endpoints:
      - endpoint: "POST /register"
        description: "Registers a new user and its associated 'ente'. Returns a boolean indicating success."
        response: "{ success: true, status: 201, data: true }"
      - endpoint: "POST /login"
        description: "Logs in a user, returning the user object (without password) and a JWT token."
        response: "{ success: true, status: 200, data: { user: { ... }, token: '...' } }"
  - name: "Entity Management"
    description: "CRUD operations for 'entes' (clients, offices, etc.)."
    base_path: "/api/entes"
    authentication_required: true
  - name: "AI Content Generation"
    description: "Uses 'gemini-1.5-pro' to generate text from a prompt."
    base_path: "/api/content"
    endpoint: "POST /generate"
    authentication_required: true

business_rules:
  - rule_id: "BR01_GESTION_TRACEABILITY"
    description: "A 'gestion' record must be created for every new policy or renewal."
  - rule_id: "BR02_NO_SELF_MANAGEMENT"
    description: "Agents cannot process policies where they are an interested party (policyholder, insured, beneficiary)."
  - rule_id: "BR03_USER_DELETION_POLICY"
    description: "When a user is deleted, their active 'gestiones' are reassigned to another agent, not deleted."
  - rule_id: "BR04_OFFICE_CURRENCY"
    description: "Each office operates with a primary currency. For global reports, amounts must be converted to a reference currency."
  - rule_id: "BR05_AUDIT_TRAIL"
    description: "All critical actions must be logged with user ID, action, affected document, and timestamp."
  - rule_id: "BR06_IMMUTABLE_SUPER_ADMIN"
    description: "The Super Admin user cannot be modified or deleted via the API."
  - rule_id: "BR07_TEMP_CLIENT_LIFECYCLE"
    description: "The 'clientes_gestion' record is temporary and destroyed when the client becomes a permanent 'ente'."
  - rule_id: "BR08_COMPANY_UNIQUENESS"
    description: "Cannot create duplicate companies with the same RIF or name."

testing:
  test_credentials:
    - role: "Super Admin"
      email: "admin@seguroplus.com"
      password: "password123"
      source: "seed.ts"
