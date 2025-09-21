import swaggerJSDoc from 'swagger-jsdoc';

// Basic Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Express API for SeguroPlus',
    version: '1.0.0',
    description: 'API documentation for the SeguroPlus backend services.',
  },
  servers: [
    {
      url: 'http://localhost:3001', // Updated port
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
        }
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          error: {
            type: 'object',
            properties: {
                code: { type: 'string', example: 'AUTH_INVALID_TOKEN' },
                message: { type: 'string' }
            }
          }
        },
      },
    },
  },
};

// Options for swagger-jsdoc
const options = {
  swaggerDefinition,
  // Paths to the API docs. The processor will look for JSDoc comments in these files.
  apis: ['./src/routes/*.ts'], 
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
