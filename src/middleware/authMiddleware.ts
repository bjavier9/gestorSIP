import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import ApiError from '../utils/ApiError';

// Extend the Express Request type to include the user payload
interface AuthenticatedRequest extends Request {
    user?: string | jwt.JwtPayload;
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    // This error is thrown on startup if the secret is missing, which is appropriate.
    throw new Error('FATAL_ERROR: JWT_SECRET environment variable is not set.');
}

export const authMiddleware = asyncHandler((req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Throw an ApiError for missing token, which will be caught by the central handler
        throw new ApiError('AUTH_TOKEN_MISSING');
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach decoded user info to the request
        next(); // Proceed to the next middleware
    } catch (error) {
        // Throw an ApiError for an invalid token
        throw new ApiError('AUTH_TOKEN_INVALID');
    }
});
