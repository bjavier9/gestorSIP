
import { inject, injectable } from 'inversify';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { EnteRepository } from '../domain/ports/enteRepository.port';
import { UserRepository } from '../domain/ports/userRepository.port';
import { TYPES } from '../config/types';
import { User } from '../domain/user';
import { Ente, EnteInput } from '../domain/ente';
import ApiError from '../utils/ApiError';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

if (!JWT_SECRET) {
    throw new Error('FATAL_ERROR: JWT_SECRET environment variable is not set.');
}

export type RegisterInput = Pick<User, 'email' | 'password'> & Omit<Ente, 'id' | 'fechaCreacion' | 'fechaActualizacion'>;

@injectable()
export class AuthService {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.EnteRepository) private enteRepository: EnteRepository
    ) { }

    public async register(data: RegisterInput): Promise<Omit<User, 'password'>> {
        const { email, password, ...enteData } = data;

        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new ApiError('AUTH_USER_ALREADY_EXISTS');
        }

        const nuevoEnte = await this.enteRepository.save(enteData as EnteInput);

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser: User = {
            id: randomUUID(),
            email,
            password: hashedPassword,
            enteId: nuevoEnte.id,
            roles: ['user'], 
            createdAt: new Date(),
        };

        await this.userRepository.save(newUser);

        const { password: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    public async login(email: string, pass: string): Promise<{ user: Omit<User, 'password'>, token: string }> {

        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new ApiError('AUTH_INVALID_CREDENTIALS');
        }

        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) {
            throw new ApiError('AUTH_INVALID_CREDENTIALS');
        }

        const payload = { id: user.id, roles: user.roles };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        const { password, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
}
