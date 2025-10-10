import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { UserRole } from '../domain/entities/roles';
import logger from '../utils/logger';

// This middleware assumes that the token has already been verified by another middleware
// and that req.user contains the token's payload.

export const authorize = (allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // The payload of the JWT is assigned to req.user
        const payload = (req as any).user;

        // The actual user object is nested inside the payload
        const user = payload.user;

        if (!user || !user.role) {
            logger.error('Authorization failed: User or role not found in token payload.', {
                errorMessage: 'User property is missing or does not contain a role.',
                errorCode: 401,
                originalError: 'AUTH_PAYLOAD_INVALID',
                receivedPayload: payload 
            });
            return next(new ApiError('AUTH_UNAUTHORIZED', 'Authentication required.', 401));
        }

        if (!allowedRoles.includes(user.role)) {
            logger.warn('Forbidden access attempt', {
                requiredRoles: allowedRoles,
                userRole: user.role,
                userId: user.uid,
                path: req.originalUrl
            });
            return next(new ApiError('AUTH_FORBIDDEN', 'You do not have permission to access this resource.', 403));
        }

        next();
    };
};

/**
 * Middleware to check if the user has the SUPERADMIN role.
 */
export const isSuperAdmin = authorize([UserRole.SUPERADMIN]);
