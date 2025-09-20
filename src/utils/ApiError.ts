import errorMessages from './errorMessages.json';
import Logger from '../config/logger';

// Defines the possible keys for known API errors.
export type ErrorKey = keyof typeof errorMessages;

/**
 * Custom error class for API-specific errors.
 * It automatically looks up the status code and a generic description from `errorMessages.json`
 * using a provided key. This ensures consistent error responses.
 *
 * This class also automatically logs the error using the centralized logger,
 * providing structured data for better observability.
 */
export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly errorKey: ErrorKey;
    public readonly originalError: any;

    constructor(key: ErrorKey, customMessage?: string, originalError?: any) {
        // Use the custom message if provided, otherwise fall back to the one from the JSON file.
        const message = customMessage || errorMessages[key].description;
        super(message);

        // Set properties for the custom error
        this.name = 'ApiError';
        this.statusCode = errorMessages[key].status;
        this.errorKey = key;
        this.originalError = originalError;

        // Automatically log the error with structured metadata upon creation.
        // This is ideal for log management systems.
        Logger.error(
            `ApiError Caught: ${this.errorKey}`, // A concise primary message for quick scanning
            {
                // All other details are placed in a structured metadata object.
                error: {
                    key: this.errorKey,
                    message: this.message, // The final display message
                    statusCode: this.statusCode,
                    stack: this.stack, // Include stack trace for debugging
                    // Include the original error if it was wrapped
                    ...(this.originalError && { originalError: this.originalError }),
                }
            }
        );

        // This is necessary to make `instanceof ApiError` work correctly in TypeScript.
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

export default ApiError;
