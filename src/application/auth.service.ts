import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Logger from '../config/logger';
import { UserRepository } from "../domain/ports/userRepository.port";
import { EnteRepository, EnteInput } from '../domain/ports/enteRepository.port';
import { User } from "../domain/user";
import ApiError from "../utils/ApiError";
import { v4 as uuidv4 } from 'uuid';

export interface RegisterInput {
    email: string;
    password: string;
    nombre: string;
    telefono: string;
    companiaCorretajeId: string;
}

export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly enteRepository: EnteRepository,
    ) {}

    async register(data: RegisterInput): Promise<{ user: User, token: string }> {
        const { email, password, nombre, telefono } = data;

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new ApiError('SERVER_INTERNAL_ERROR', 'JWT secret is not configured.');
        }

        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            Logger.warn(`Registration attempt for existing email: ${email}`);
            throw new ApiError('VALIDATION_ERROR', 'Email already in use');
        }

        const enteInput: EnteInput = {
            nombre,
            telefono,
            correo: email,
            tipo: 'Persona Natural',
            activo: true,
            direccion: 'N/A',
        };
        
        Logger.info(`Creating new ente for user: ${email}`);
        const newEnte = await this.enteRepository.save(enteInput);

        const userId = uuidv4();
        const userToSave: Omit<User, 'createdAt'> = {
            id: userId,
            email,
            password,
            enteId: newEnte.id,
            roles: ['user'],
        };

        Logger.info(`Creating new user with email: ${email}`);
        await this.userRepository.save(userToSave);

        const newUser: User = {
            ...userToSave,
            createdAt: new Date(),
        };
        
        // Hardcodeando expiresIn como paso de depuración
        const token = jwt.sign({ id: newUser.id, email: newUser.email }, jwtSecret, { expiresIn: '1h' });

        return { user: newUser, token };
    }

    async login(email: string, pass: string): Promise<{ user: User, token: string }> {
        Logger.info(`Login attempt for email: ${email}`);

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new ApiError('SERVER_INTERNAL_ERROR', 'JWT secret is not configured.');
        }
        
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            Logger.warn(`Login failed: User not found for email: ${email}`);
            throw new ApiError('AUTH_INVALID_CREDENTIALS');
        }

        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) {
            Logger.warn(`Login failed: Invalid password for email: ${email}`);
            throw new ApiError('AUTH_INVALID_CREDENTIALS');
        }
        
        // Hardcodeando expiresIn como paso de depuración
        const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: '1h' });

        Logger.info(`User logged in successfully: ${email}`);
        return { user, token };
    }
}
