import errorMessages from './errorMessages.json';

// Define a type for the keys of the error messages object to ensure type safety
type ErrorKey = keyof typeof errorMessages;

class ApiError extends Error {
    public readonly statusCode: number;
    public readonly errorKey: ErrorKey;

    constructor(key: ErrorKey, message?: string) {
        // If a specific message is provided, use it. Otherwise, use the generic description.
        super(message || errorMessages[key].description);
        
        this.statusCode = errorMessages[key].status;
        this.errorKey = key;

        // This is necessary to make `instanceof ApiError` work correctly
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

export default ApiError;
