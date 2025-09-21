import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { ApiError } from '../utils/ApiError';

// Extend Express Request type to include a user property
interface AuthenticatedRequest extends Request {
    user?: any; // Define a more specific type for user if you have one
}

// Asegúrate de que JWT_SECRET esté definido. Si no lo está, lanza un error.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('FATAL_ERROR: JWT_SECRET environment variable is not set.');
}

export const authMiddleware = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Si no hay token o el formato es incorrecto, lanzamos un error.
        throw new ApiError('AUTH_TOKEN_MISSING');
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verificamos el token. Si es válido, el payload decodificado se añade a la request.
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Ahora la información del usuario está disponible en req.user
        next(); // El usuario está autenticado, pasamos al siguiente middleware.
    } catch (error) {
        // Si el token no es válido (expirado, malformado, etc.), lanzamos un error.
        throw new ApiError('AUTH_TOKEN_INVALID');
    }
});
