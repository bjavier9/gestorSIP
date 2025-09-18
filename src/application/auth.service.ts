import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Logger from '../config/logger';
import { UserRepository } from "../domain/ports/userRepository.port";
import { EnteRepository, EnteInput } from '../domain/ports/enteRepository.port';
import { User } from "../domain/user";
import ApiError from "../utils/ApiError";
import { v4 as uuidv4 } from 'uuid';
import { EnteCompaniaRepository } from '../infrastructure/firebase/enteCompania.repository';

// Definimos la forma de los datos de entrada para el registro
export interface RegisterInput {
    email: string;
    password: string;
    nombre: string;
    telefono: string;
    companiaCorretajeId: string; // ID de la compañía a la que se une
}

export class AuthService {
    // Inyectamos los repositorios necesarios
    constructor(
        private readonly userRepository: UserRepository,
        private readonly enteRepository: EnteRepository,
        private readonly enteCompaniaRepository: EnteCompaniaRepository // Nuevo repositorio
    ) {}

    async register(data: RegisterInput): Promise<{ user: User, token: string }> {
        const { email, password, nombre, telefono, companiaCorretajeId } = data;

        // 1. Validar que el email no esté ya en uso
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            Logger.warn(`Registration attempt for existing email: ${email}`);
            throw new ApiError('VALIDATION_ERROR', 'Email already in use');
        }

        // 2. Crear el Ente asociado al usuario
        const enteInput: EnteInput = {
            nombre,
            telefono,
            correo: email, // Usamos el email del usuario como correo del ente
            tipo: 'Persona Natural', // Asumimos este tipo por defecto para nuevos usuarios
            activo: true,
        };
        
        Logger.info(`Creating new ente for user: ${email}`);
        const newEnte = await this.enteRepository.save(enteInput);

        // 3. Crear el objeto User
        const userToSave: Omit<User, 'id'> = {
            email,
            password, // El hash se hará en el repositorio
            enteId: newEnte.id
        };

        // 4. Guardar el usuario (el repositorio se encargará de hashear la contraseña)
        Logger.info(`Creating new user with email: ${email}`);
        const newUser = await this.userRepository.save(userToSave);

        // 5. Crear la relación Ente-Compañía
        Logger.info(`Linking ente ${newEnte.id} to company ${companiaCorretajeId}`);
        await this.enteCompaniaRepository.create(newEnte.id, companiaCorretajeId, ['agente']);

        // 6. Generar el token JWT
        const token = this.generateToken(newUser.id);
        
        Logger.info(`User ${email} registered successfully.`);
        return { user: newUser, token };
    }

    async login(email: string, pass: string): Promise<{ user: Omit<User, 'password'>, token: string }> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            Logger.warn(`Failed login attempt for email: ${email}`);
            throw new ApiError('AUTH_INVALID_CREDENTIALS', 'Invalid credentials');
        }

        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) {
            Logger.warn(`Invalid password for user: ${email}`);
            throw new ApiError('AUTH_INVALID_CREDENTIALS', 'Invalid credentials');
        }

        const { password, ...userWithoutPassword } = user;
        const token = this.generateToken(user.id);

        Logger.info(`User ${email} logged in successfully.`);
        return { user: userWithoutPassword, token };
    }

    private generateToken(userId: string): string {
        const secret = process.env.JWT_SECRET || 'your_default_secret_key';
        if (secret === 'your_default_secret_key'){
            Logger.warn('Using default JWT secret. Please set JWT_SECRET environment variable.');
        }
        return jwt.sign({ id: userId }, secret, { expiresIn: '8h' });
    }
}
