import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'GestorSIP API Documentation',
            version: '1.1.0', // Incremented version after fixes
            description: 'API backend for an insurance management platform, built with Node.js, Express, and a Hexagonal Architecture.',
            contact: {
                name: 'API Support',
                email: 'dev@seguroplus.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000', // Matches default server port
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                // Generic Response Building Blocks
                ResponseHeader: {
                    type: 'object',
                    properties: {
                        timestamp: { type: 'string', format: 'date-time', example: '2024-01-31T15:04:05.000Z' },
                        token: { type: 'string', nullable: true, description: 'JWT token echoed when available.' },
                    },
                    required: ['timestamp'],
                },
                SuccessStatus: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', enum: [true] },
                        code: { type: 'integer', example: 200 },
                    },
                    required: ['success', 'code'],
                },
                ErrorStatus: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', enum: [false] },
                        code: { type: 'integer', example: 400 },
                    },
                    required: ['success', 'code'],
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        header: { $ref: '#/components/schemas/ResponseHeader' },
                        body: {
                            type: 'object',
                            properties: {
                                data: { description: 'Payload data.', nullable: true },
                                message: { type: 'string', nullable: true },
                            },
                        },
                        status: { $ref: '#/components/schemas/SuccessStatus' },
                    },
                    required: ['header', 'body', 'status'],
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        header: { $ref: '#/components/schemas/ResponseHeader' },
                        body: {
                            type: 'object',
                            properties: {
                                error: {
                                    type: 'object',
                                    properties: {
                                        key: { type: 'string' },
                                        message: { type: 'string' },
                                    },
                                    required: ['key', 'message'],
                                },
                            },
                            required: ['error'],
                        },
                        status: { $ref: '#/components/schemas/ErrorStatus' },
                    },
                    required: ['header', 'body', 'status'],
                },
// --- Auth Schemas ---
                LoginRequest: {
                    type: 'object',
                    required: ['idToken'],
                    properties: {
                        idToken: { type: 'string', description: "Firebase Auth ID Token." },
                    },
                },
                SelectCompaniaRequest: {
                    type: 'object',
                    required: ['companiaId'],
                    properties: {
                        companiaId: { type: 'string', description: "ID of the company to scope the session to." },
                    },
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        user: { $ref: '#/components/schemas/Usuario' },
                        token: { type: 'string', description: "Final or partial JWT.", nullable: true },
                        needsSelection: { type: 'boolean', description: "True if user must select a company.", nullable: true },
                        companias: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/UsuarioCompania' },
                            nullable: true,
                        },
                    },
                },

                // --- Main Data Models ---
                Usuario: {
                    type: 'object',
                    properties: {
                        uid: { type: 'string', readOnly: true },
                        email: { type: 'string', format: 'email', readOnly: true },
                        nombre: { type: 'string' },
                        activo: { type: 'boolean' },
                        fechaCreacion: { type: 'string', format: 'date-time', readOnly: true },
                        ultimoAcceso: { type: 'string', format: 'date-time', readOnly: true },
                    },
                },
                UsuarioCompania: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        nombre: { type: 'string' },
                        roles: { type: 'array', items: { type: 'string' } },
                    },
                },
                Ente: {
                    type: 'object',
                    required: ['enteId', 'tipoEnte', 'activo', 'fechaCreacion'],
                    properties: {
                        enteId: { type: 'string', readOnly: true },
                        tipoEnte: { type: 'string', enum: ['persona_natural', 'persona_juridica'] },
                        activo: { type: 'boolean' },
                        fechaCreacion: { type: 'string', format: 'date-time', readOnly: true },
                        // Discriminator-like properties
                        metadataNatural: { $ref: '#/components/schemas/MetadataNatural', nullable: true },
                        metadataJuridica: { $ref: '#/components/schemas/MetadataJuridica', nullable: true },
                    },
                },
                MetadataNatural: {
                    type: 'object',
                    properties: {
                        nombres: { type: 'string' },
                        apellidos: { type: 'string' },
                        cedula: { type: 'string' },
                        fechaNacimiento: { type: 'string', format: 'date' },
                    },
                },
                MetadataJuridica: {
                    type: 'object',
                    properties: {
                        razonSocial: { type: 'string' },
                        rif: { type: 'string' },
                        fechaConstitucion: { type: 'string', format: 'date' },
                    },
                },

                // --- DTOs for Input/Update ---
                EnteInput: {
                    type: 'object',
                    description: "Schema for creating a new ente."
                    // Define properties based on what's needed to create an Ente
                },
                EnteUpdateInput: {
                    type: 'object',
                    description: "Schema for updating an existing ente."
                    // Define properties that are updatable
                },
                                Modificado: {
                    type: 'object',
                    properties: {
                        idente: { type: 'integer' },
                        fechaActualizacion: { type: 'string', format: 'date-time' },
                    },
                },
                Creada: {
                    type: 'object',
                    properties: {
                        idente: { type: 'integer' }
                    },
                },
                CompaniaCorretaje: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        nombre: { type: 'string' },
                        rif: { type: 'string' },
                        direccion: { type: 'string' },
                        telefono: { type: 'string' },
                        correo: { type: 'string', format: 'email' },
                        fechaCreacion: { type: 'string', format: 'date-time' },
                        fechaActualizacion: { type: 'string', format: 'date-time' },
                        activo: { type: 'boolean' },
                        creada: { $ref: '#/components/schemas/Creada' },
                        modificado: { type: 'array', items: { $ref: '#/components/schemas/Modificado' } },
                        monedasAceptadas: { type: 'array', items: { type: 'string' } },
                        monedaPorDefecto: { type: 'string' },
                        modulos: { type: 'array', items: { type: 'string' } },
                    },
                    required: ['id','nombre','rif','fechaCreacion','fechaActualizacion','activo']
                },
                CreateCompaniaRequest: {
                    type: 'object',
                    description: 'Payload to create a brokerage company',
                    properties: {
                        nombre: { type: 'string' },
                        rif: { type: 'string' },
                        direccion: { type: 'string' },
                        telefono: { type: 'string' },
                        correo: { type: 'string', format: 'email' },
                        monedasAceptadas: { type: 'array', items: { type: 'string' } },
                        monedaPorDefecto: { type: 'string' },
                        modulos: { type: 'array', items: { type: 'string' } },
                        activo: { type: 'boolean' }
                    },
                    required: ['nombre','rif']
                },
                UpdateCompaniaRequest: {
                    type: 'object',
                    description: 'Payload to update a brokerage company (all fields optional)',
                    properties: {
                        nombre: { type: 'string' },
                        rif: { type: 'string' },
                        direccion: { type: 'string' },
                        telefono: { type: 'string' },
                        correo: { type: 'string', format: 'email' },
                        monedasAceptadas: { type: 'array', items: { type: 'string' } },
                        monedaPorDefecto: { type: 'string' },
                        modulos: { type: 'array', items: { type: 'string' } },
                        activo: { type: 'boolean' }
                    }
                },
                Lead: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        nombre: { type: 'string' },
                        correo: { type: 'string', format: 'email' },
                        telefono: { type: 'string' },
                        companiaCorretajeId: { type: 'string' },
                        agenteId: { type: 'string', nullable: true },
                        fechaCreacion: { type: 'string', format: 'date-time' },
                        fechaActualizacion: { type: 'string', format: 'date-time' },
                        estado: { type: 'string', enum: ['nuevo','contactado','calificado','perdido','ganado'] },
                        origen: { type: 'string' },
                    }
                },
                CreateLeadRequest: {
                    type: 'object',
                    required: ['nombre','correo','telefono','origen'],
                    properties: {
                        nombre: { type: 'string' },
                        correo: { type: 'string', format: 'email' },
                        telefono: { type: 'string' },
                        origen: { type: 'string' },
                        estado: { type: 'string', enum: ['nuevo','contactado','calificado','perdido','ganado'], nullable: true }
                    }
                },
                UpdateLeadRequest: {
                    type: 'object',
                    properties: {
                        nombre: { type: 'string' },
                        correo: { type: 'string', format: 'email' },
                        telefono: { type: 'string' },
                        origen: { type: 'string' },
                        estado: { type: 'string', enum: ['nuevo','contactado','calificado','perdido','ganado'] },
                        agenteId: { type: 'string' }
                    }
                },
                Oficina: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        companiaCorretajeId: { type: 'string' },
                        nombre: { type: 'string' },
                        direccion: { type: 'string' },
                        telefono: { type: 'string' },
                        moneda: { type: 'string' },
                        activo: { type: 'boolean' },
                        fechaCreacion: { type: 'string', format: 'date-time' },
                        fechaActualizacion: { type: 'string', format: 'date-time' },
                    },
                    required: ['id','companiaCorretajeId','nombre','direccion','telefono','moneda','activo','fechaCreacion','fechaActualizacion'],
                },
                CreateOficinaRequest: {
                    type: 'object',
                    required: ['nombre','direccion','telefono','moneda','activo'],
                    properties: {
                        nombre: { type: 'string' },
                        direccion: { type: 'string' },
                        telefono: { type: 'string' },
                        moneda: { type: 'string' },
                        activo: { type: 'boolean' },
                    },
                },
                UpdateOficinaRequest: {
                    type: 'object',
                    properties: {
                        nombre: { type: 'string' },
                        direccion: { type: 'string' },
                        telefono: { type: 'string' },
                        moneda: { type: 'string' },
                        activo: { type: 'boolean' },
                    },
                },
                Aseguradora: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        nombre: { type: 'string' },
                        codigo: { type: 'string' },
                        direccion: { type: 'string' },
                        telefono: { type: 'string' },
                        correo: { type: 'string', format: 'email' },
                        rating: { type: 'number' },
                        activo: { type: 'boolean' },
                        fechaCreacion: { type: 'string', format: 'date-time' },
                        fechaActualizacion: { type: 'string', format: 'date-time' },
                    },
                    required: ['id','nombre','codigo','direccion','telefono','correo','rating','activo','fechaCreacion','fechaActualizacion'],
                },
                CreateAseguradoraRequest: {
                    type: 'object',
                    required: ['nombre','codigo','direccion','telefono','correo','rating','activo'],
                    properties: {
                        nombre: { type: 'string' },
                        codigo: { type: 'string' },
                        direccion: { type: 'string' },
                        telefono: { type: 'string' },
                        correo: { type: 'string', format: 'email' },
                        rating: { type: 'number' },
                        activo: { type: 'boolean' },
                    },
                },
                UpdateAseguradoraRequest: {
                    type: 'object',
                    properties: {
                        nombre: { type: 'string' },
                        codigo: { type: 'string' },
                        direccion: { type: 'string' },
                        telefono: { type: 'string' },
                        correo: { type: 'string', format: 'email' },
                        rating: { type: 'number' },
                        activo: { type: 'boolean' },
                    },
                },
                Poliza: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        numeroPoliza: { type: 'string' },
                        tipoPolizaId: { type: 'string' },
                        aseguradoraId: { type: 'string' },
                        tomadorId: { type: 'number' },
                        aseguradoId: { type: 'number' },
                        companiaCorretajeId: { type: 'string' },
                        oficinaId: { type: 'string' },
                        agenteId: { type: 'string', nullable: true },
                        fechaInicio: { type: 'string', format: 'date-time' },
                        fechaVencimiento: { type: 'string', format: 'date-time' },
                        montoAsegurado: { type: 'number' },
                        prima: { type: 'number' },
                        moneda: { type: 'string' },
                        estado: { type: 'string' },
                        fechaCreacion: { type: 'string', format: 'date-time' },
                        fechaActualizacion: { type: 'string', format: 'date-time' },
                    },
                    required: ['id','numeroPoliza','tipoPolizaId','aseguradoraId','tomadorId','aseguradoId','companiaCorretajeId','oficinaId','fechaInicio','fechaVencimiento','montoAsegurado','prima','moneda','estado','fechaCreacion','fechaActualizacion'],
                },
                PolizaSearchResponse: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Poliza' },
                        },
                        message: { type: 'string', nullable: true },
                    },
                },
                ConfigurationItem: {
                    type: 'object',
                    properties: {
                        activo: { type: 'boolean' },
                    },
                    additionalProperties: true,
                },
                Configuration: {
                    type: 'object',
                    required: ['id','name','description','items'],
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        items: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/ConfigurationItem' },
                        },
                    },
                },
                ConfigurationCreateRequest: {
                    type: 'object',
                    required: ['id','name','description','items'],
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        items: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/ConfigurationItem' },
                        },
                    },
                },
                ConfigurationUpdateRequest: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        description: { type: 'string' },
                        items: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/ConfigurationItem' },
                        },
                    },
                },
            },
        },
    },

    // IMPORTANT: Path to the files containing OpenAPI annotations
    apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
