import { Request, Response, NextFunction } from 'express';

// asyncHandler es una función de utilidad que envuelve los manejadores de ruta asíncronos
// para asegurar que cualquier error sea capturado y pasado a next().
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
};
