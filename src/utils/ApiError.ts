const defaultMessages: { [key: number]: string } = {
    400: 'Solicitud incorrecta.',
    401: 'No autorizado.',
    403: 'Prohibido.',
    404: 'Recurso no encontrado.',
    500: 'Error interno del servidor.'
};

const defaultKeys: { [key: number]: string } = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    500: 'INTERNAL_SERVER_ERROR'
};

const getErrorMessage = (statusCode: number) => defaultMessages[statusCode] || 'Error desconocido.';
const getErrorKey = (statusCode: number) => defaultKeys[statusCode] || 'UNKNOWN_ERROR';

/**
 * A custom error class for handling API-specific errors in a structured way.
 * It ensures that all errors sent back to the client have a consistent format.
 */
export class ApiError extends Error {
  public statusCode: number;
  public errorKey: string;
  public originalError?: any; // Add optional originalError property

  /**
   * Creates an instance of ApiError.
   * @param errorKey A specific key for the error (e.g., 'AUTH_TOKEN_MISSING').
   * @param message A human-readable message describing the error.
   * @param statusCode The HTTP status code for the response.
   * @param originalError The original error object, for logging or debugging.
   */
  constructor(
    errorKey: string,
    message?: string,
    statusCode: number = 500,
    originalError?: any // Add optional originalError parameter
  ) {
    // Si no se proporciona un mensaje, intenta obtener uno predeterminado basado en el statusCode.
    const finalMessage = message || getErrorMessage(statusCode);
    super(finalMessage);

    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorKey = errorKey;
    this.originalError = originalError; // Assign it to the property

    // Esto es importante para que `instanceof` funcione correctamente con errores en TypeScript.
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
