import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { ApiError } from '../utils/ApiError';

// Extiende el tipo de Request de Express para incluir una propiedad de usuario
interface AuthenticatedRequest extends Request {
    user?: any; // Puedes definir un tipo más específico para el usuario si lo tienes
}

// Ya no hay una comprobación global aquí. Se ha movido al interior de la función.

export const authMiddleware = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // 1. Obtén el secreto DENTRO de la función, solo cuando se necesita.
    const JWT_SECRET = process.env.JWT_SECRET;

    // 2. Comprueba el secreto aquí. Esto es una verificación en tiempo de ejecución, no en tiempo de importación.
    if (!JWT_SECRET) {
        // Esto ahora lanzará un error claro durante una petición si el servidor está mal configurado,
        // pero no impedirá que el servidor se inicie.
        console.error("CRITICAL: JWT_SECRET no está configurado. La autenticación es imposible.");
        throw new ApiError('SERVER_CONFIG_ERROR', 'El servidor no está configurado correctamente para la autenticación.', 500);
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Si no hay token o el formato es incorrecto, lanzamos un error.
        throw new ApiError('AUTH_TOKEN_MISSING', 'El token de autenticación no se ha proporcionado.', 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        // 3. Usa la constante JWT_SECRET de ámbito local.
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Ahora la información del usuario está disponible en req.user
        next(); // El usuario está autenticado, pasamos al siguiente middleware.
    } catch (error) {
        // Si el token no es válido (expirado, malformado, etc.), lanzamos un error.
        throw new ApiError('AUTH_TOKEN_INVALID', 'El token proporcionado no es válido o ha expirado.', 403);
    }
});

export const superAdminMiddleware = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Corregido: Compara con 'superAdmin' (distingue mayúsculas y minúsculas) para que coincida con el payload del JWT
    if (req.user && req.user.user && req.user.user.role === 'superAdmin') {
        next();
    } else {
        throw new ApiError('FORBIDDEN', 'Acceso denegado. Se requiere rol de Super Admin.', 403);
    }
});
