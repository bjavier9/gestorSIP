import swaggerJSDoc from 'swagger-jsdoc';

// Basic Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Express API with Swagger',
    version: '1.0.0',
    description: 'A simple CRUD API application made with Express and documented with Swagger',
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Development server',
    },
  ],
  components: {
    schemas: {
      SuccessResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          message: { type: 'string' },
          code: { type: 'string' },
        },
      },
    },
  },
};

// Options for swagger-jsdoc
const options = {
  swaggerDefinition,
  // Path to the API docs
  apis: ['./src/routes/*.ts', './src/domain/*.ts'], // Looks for JSDoc in these files
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
