import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import logger from '../utils/logger';

// Extiende la interfaz de Request para incluir la propiedad 'user'
export interface AuthenticatedRequest extends Request {
  user?: any; // O un tipo más específico si tienes la interfaz del payload del token
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Authentication token missing or malformed', { path: req.path });
    return next(new ApiError('AUTH_TOKEN_MISSING', 'No authentication token provided.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret');
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Invalid authentication token', {
      errorMessage: (error as Error).message,
      errorCode: 401,
      originalError: 'AUTH_INVALID_TOKEN'
    });
    return next(new ApiError('AUTH_INVALID_TOKEN', 'Invalid or expired token.', 401));
  }
};
