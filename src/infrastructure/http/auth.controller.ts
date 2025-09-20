import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { AuthService, RegisterInput } from '../../application/auth.service';
import { handleSuccess } from '../../utils/responseHandler';
import { TYPES } from '../../config/types'; // Make sure to import TYPES

@injectable() // Add this decorator
export class AuthController {
    constructor(
        @inject(TYPES.AuthService) private readonly authService: AuthService // Add @inject decorator
    ) {}

    async register(req: Request, res: Response) {
        const registerData: RegisterInput = req.body;
        
        const success = await this.authService.register(registerData);
        
        handleSuccess(res, success, 201);
    }

    async login(req: Request, res: Response) {
        const { email, password } = req.body;
        console.log('Received login request with email:', email)
        const { user, token } = await this.authService.login(email, password);
        handleSuccess(res, { user, token });
    }
}