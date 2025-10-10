
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { UserRole } from '../domain/entities/roles';
import logger from '../utils/logger';

/**
 * Middleware to verify that the user can only access resources from their own company.
 * A SUPERADMIN user can bypass this check.
 * It assumes that the authenticate middleware has already been executed.
 */
export const validateCompaniaAccess = (req: Request, res: Response, next: NextFunction) => {
    const payload = (req as any).user;
    const user = payload?.user;

    // 1. Check if user and role exist in the token
    if (!user || !user.role) {
        logger.error('Authorization failed: User or role not found in token payload.', {
            errorCode: 401,
            originalError: 'AUTH_PAYLOAD_INVALID',
        });
        return next(new ApiError('AUTH_UNAUTHORIZED', 'Authentication required.', 401));
    }

    // 2. If the user is a SUPERADMIN, allow access without further checks.
    if (user.role === UserRole.SUPERADMIN) {
        return next();
    }

    // 3. Get the company ID from the URL parameters
    const companiaIdFromParams = req.params.id;
    if (!companiaIdFromParams) {
         // This might happen if the route is not standard. 
         // We will only log it, because maybe other validation will apply.
        return next();
    }

    // 4. Get the company ID from the user's token
    const companiaIdFromToken = user.companiaCorretajeId;
    if (!companiaIdFromToken) {
        logger.warn('User token does not contain a company ID.', {
            userId: user.uid,
            email: user.email
        });
        return next(new ApiError('FORBIDDEN', 'Your user is not associated with any company.', 403));
    }

    // 5. Compare IDs and deny access if they do not match
    if (companiaIdFromParams !== companiaIdFromToken) {

        return next(new ApiError('FORBIDDEN', 'You do not have permission to access this resource.', 403));
    }

    // 6. If everything is fine, proceed to the next middleware or route handler
    next();
};
