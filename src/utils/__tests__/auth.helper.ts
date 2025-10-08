import jwt from 'jsonwebtoken';
import { UserRole } from '../../domain/entities/roles';

/**
 * Genera un token JWT válido para usar en los tests.
 * @param payload - La información del usuario a incluir en el token.
 * @returns Un string con el token JWT firmado.
 */
export const generateTestToken = (
    payload: {
        uid: string;
        role: UserRole;
        companiaCorretajeId: string;
        email: string;
    }
): string => {
    // El payload debe coincidir con la estructura que genera tu endpoint de login
    const tokenPayload = {
        user: {
            id: payload.uid, // O uid, dependiendo de lo que uses
            uid: payload.uid,
            role: payload.role,
            companiaCorretajeId: payload.companiaCorretajeId,
            email: payload.email,
        },
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET no está definida. Asegúrate de cargar las variables de entorno para los tests.');
    }

    return jwt.sign(tokenPayload, secret, { expiresIn: '1h' });
};
