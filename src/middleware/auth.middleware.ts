import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { UserRole } from '../domain/entities/roles';
import logger from '../utils/logger';

// Este middleware asume que el token ya ha sido verificado por otro middleware
// y que req.user contiene el payload del token.

export const authorize = (allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        if (!user || !user.role) {
             logger.error('Authentication required', { 
                errorMessage:`${JSON.stringify(user)}` ,
                errorCode: 401,
                originalError: 'AUTH_UNAUTHORIZED'
            });
            return next(new ApiError('AUTH_UNAUTHORIZED', 'Authentication required.', 401));
        }

        if (!allowedRoles.includes(user.role as UserRole)) {
            return next(new ApiError('AUTH_FORBIDDEN', 'You do not have permission to access this resource.', 403));
        }

        next();
    };
};

export const isSuperAdmin = authorize([UserRole.SUPERADMIN]);
