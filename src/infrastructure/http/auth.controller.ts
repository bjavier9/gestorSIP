import { Request, Response } from 'express';
import { AuthService, RegisterInput } from '../../application/auth.service';
import { handleSuccess } from '../../utils/responseHandler';

export class AuthController {
    constructor(private readonly authService: AuthService) {}

    async register(req: Request, res: Response) {
        // El cuerpo de la petición ahora debe coincidir con la interfaz RegisterInput
        const registerData: RegisterInput = req.body;
        
        const { user, token } = await this.authService.register(registerData);
        
        // Por seguridad, nunca devolvemos la contraseña en la respuesta.
        const { password, ...userWithoutPassword } = user;
        
        handleSuccess(res, { user: userWithoutPassword, token });
    }

    async login(req: Request, res: Response) {
        const { email, password } = req.body;
        const { user, token } = await this.authService.login(email, password);
        handleSuccess(res, { user, token });
    }
}
