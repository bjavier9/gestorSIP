import { Request, Response, NextFunction } from 'express';
import { handleError } from '../utils/responseHandler';
import { ApiError } from '../utils/ApiError';

/**
 * A centralized error handling middleware for the Express application.
 * It catches errors passed via `next(error)` and sends a standardized JSON response.
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    // The `handleError` function will check if it's an instance of ApiError
    // or a generic error and format the response accordingly.
    handleError(res, err);
};

/**
 * Middleware to handle routes that are not found.
 * If no other route handler has responded, this will create a 404 error
 * and pass it to the centralized error handler.
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    // Create a new ApiError for a 404 and pass it to the next middleware (the errorHandler)
    const apiError = new ApiError('ROUTING_NOT_FOUND', 'El endpoint solicitado no existe.', 404);
    next(apiError);
};
