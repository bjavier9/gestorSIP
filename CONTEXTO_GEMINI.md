# Gemini Project Context (Format: YAML)
# Instructions: Provide this file's content to Gemini at the start of a new chat session.

project:
  name: "SeguroPlus (inferred)"
  description: "Backend API for an insurance management platform."
  tech_stack:
    - "Node.js"
    - "Express"
    - "TypeScript"
  architecture:
    pattern: "Hexagonal (Ports and Adapters)"
    layers:
      - domain: "Business logic, entities, repository ports (interfaces)."
      - application: "Services that orchestrate domain logic."
      - infrastructure: "Technical implementations (DB adapters, HTTP controllers)."
  database:
    type: "Firebase/Firestore"

data_model:
  firestore_collections:
    - companias
    - oficinas
    - aseguradoras
    - tipos_polizas
    - entes
    - usuarios_companias
    - polizas
    - gestiones
    - clientes_gestion # Temporary collection for new clients
    - auditoria
    - configurations

features:
  - name: "Authentication"
    type: "JWT"
    endpoints:
      - endpoint: "POST /register"
        description: "Registers a new user and its associated 'ente'. Returns a boolean indicating success."
        response: "{ success: true, status: 201, data: true }"
      - endpoint: "POST /login"
        description: "Logs in a user, returning the user object (without password) and a JWT token."
        response: "{ success: true, status: 200, data: { user: { ... }, token: '...' } }"
  - name: "Entity_Management"
    description: "CRUD operations for 'entes' (clients, offices, etc.)."
  - name: "AI_Content_Generation"
    description: "Uses 'gemini-1.5-pro' to generate text from a prompt."
    endpoint: "POST /api/content/generate"
    authentication_required: true

business_rules:
  - rule_id: "BR01_GESTION_TRACEABILITY"
    description: "A 'gestion' record must be created for every new policy or renewal."
    source: "funcionamiento.txt"
  - rule_id: "BR02_NO_SELF_MANAGEMENT"
    description: "Agents cannot process policies where they are an interested party (policyholder, insured, beneficiary)."
    source: "funcionamiento.txt"
  - rule_id: "BR03_USER_DELETION_POLICY"
    description: "When a user is deleted by a supervisor, their active 'gestiones' are reassigned to another agent, not deleted."
    source: "funcionamiento.txt"
  - rule_id: "BR04_OFFICE_CURRENCY"
    description: "Each office operates with a primary currency. For global reports, all amounts must be converted to a single reference currency (e.g., USD)."
    source: "funcionamiento.txt"
  - rule_id: "BR05_AUDIT_TRAIL"
    description: "All critical actions must be logged. Each audit entry must contain at least: user ID, action performed, affected collection, document ID, and a timestamp."
    source: "funcionamiento.txt"
  - rule_id: "BR06_IMMUTABLE_SUPER_ADMIN"
    description: "The Super Admin user cannot be modified or deleted via the API. Its credentials can only be set or changed via environment variables or a secure configuration file."
    source: "funcionamiento.txt"
  - rule_id: "BR07_TEMP_CLIENT_LIFECYCLE"
    description: "The 'clientes_gestion' record is temporary and destroyed when the client becomes a permanent 'ente'."
    source: "funcionamiento.txt"
  - rule_id: "BR08_COMPANY_UNIQUENESS"
    description: "Cannot create duplicate companies with the same RIF or name."
    source: "funcionamiento.txt"

testing:
  test_credentials:
    - role: "Super Admin"
      email: "admin@seguroplus.com"
      password: "password123"
      source: "seed.js"
