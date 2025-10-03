
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { ApiError } from '../utils/ApiError';

// Extiende el tipo de Request de Express para incluir una propiedad de usuario
interface AuthenticatedRequest extends Request {
    user?: any;
}

export const authMiddleware = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
        console.error('CRITICAL: JWT_SECRET no esta configurado. La autenticacion es imposible.');
        throw new ApiError('SERVER_CONFIG_ERROR', 'El servidor no esta configurado correctamente para la autenticacion.', 500);
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError('AUTH_TOKEN_MISSING', 'El token de autenticacion no se ha proporcionado.', 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        throw new ApiError('AUTH_TOKEN_INVALID', 'El token proporcionado no es valido o ha expirado.', 403);
    }
});

export const superAdminMiddleware = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const role = req.user && req.user.user ? req.user.user.role : undefined;
    const tokenEmail = req.user && req.user.user ? req.user.user.email : undefined;
    const configuredSuperAdminEmail = process.env.SUPERADMIN_EMAIL;

    if (!configuredSuperAdminEmail) {
        throw new ApiError('SERVER_CONFIG_ERROR', 'SUPERADMIN_EMAIL no esta configurado en el servidor.', 500);
    }

    const isSuperAdminRole = typeof role === 'string' && role.toLowerCase() === 'superadmin';
    const emailMatches = typeof tokenEmail === 'string' && tokenEmail.toLowerCase() === configuredSuperAdminEmail.toLowerCase();

    if (isSuperAdminRole && emailMatches) {
        next();
    } else {
        throw new ApiError('FORBIDDEN', 'Acceso denegado. Se requiere rol y correo de Super Admin.', 403);
    }
});

export const adminSupervisorOrSuperadminMiddleware = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const role = req.user && req.user.user ? req.user.user.role : undefined;
    const allowed = ['admin', 'supervisor', 'superadmin'];
    if (typeof role === 'string' && allowed.includes(role.toLowerCase())) {
        return next();
    }
    throw new ApiError('FORBIDDEN', 'Acceso denegado. Rol insuficiente.', 403);
});

export const authorizeCompaniaAccess = (allowedRoles: string[]) => asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user?.user;
    const { companiaId } = req.params;

    if (!user) {
        throw new ApiError('UNAUTHENTICATED', 'No hay información de usuario en la solicitud.', 401);
    }

    const { role, companiaCorretajeId } = user;

    // 1. Check Role
    if (!role || !allowedRoles.map(r => r.toLowerCase()).includes(role.toLowerCase())) {
        throw new ApiError('FORBIDDEN', `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}.`, 403);
    }

    // 2. Check Company ID
    if (!companiaCorretajeId) {
        throw new ApiError('FORBIDDEN', 'El token del usuario no contiene ID de compañía.', 403);
    }

    if (companiaCorretajeId !== companiaId) {
        throw new ApiError('FORBIDDEN', 'Acceso denegado. No tienes permiso para acceder a los recursos de esta compañía.', 403);
    }

    next();
});
