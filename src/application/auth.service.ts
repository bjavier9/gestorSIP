import { inject, injectable } from 'inversify';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { EnteRepository, EnteInput } from '../domain/ports/enteRepository.port';
import { UserRepository } from '../domain/ports/userRepository.port';
import { TYPES } from '../config/types';
import { User } from '../domain/user';
import { Ente } from '../domain/ente';
import ApiError from '../utils/ApiError';

const JWT_SECRET: string = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

if (!JWT_SECRET) {
    throw new Error('FATAL_ERROR: JWT_SECRET environment variable is not set.');
}

export type RegisterInput = Pick<User, 'email' | 'password'> &
  Omit<Ente, 'id' | 'fechaCreacion' | 'fechaActualizacion'>;

interface JWTPayload {
  id: string;
  roles: string[];
}

@injectable()
export class AuthService {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.EnteRepository) private enteRepository: EnteRepository
    ) {}

    public async register(data: RegisterInput): Promise<boolean> {
        const { email, password, ...enteData } = data;

        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new ApiError('AUTH_USER_ALREADY_EXISTS');
        }

        const nuevoEnte = await this.enteRepository.save(enteData as EnteInput);
        const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        const newUser: User = {
            id: randomUUID(),
            email,
            password: hashedPassword,
            enteId: nuevoEnte.id,
            roles: ['user'],
            createdAt: new Date(),
        };

        await this.userRepository.save(newUser);

        return true;
    }

    public async login(email: string, pass: string): Promise<{ user: Omit<User, 'password'>, token: string }> {
        console.log('--- Login Attempt ---');
        console.log('Email received:', email);
        console.log('Password received:', pass);

        const user = await this.userRepository.findByEmail(email);
        
        if (!user) {
            console.log('User not found in database.');
            throw new ApiError('AUTH_INVALID_CREDENTIALS');
        }

        console.log('User found:', user);
        console.log('Comparing received password with stored hash...');

        const isMatch = await bcrypt.compare(pass, user.password);
        console.log('Password match result:', isMatch);

        if (!isMatch) {
            console.log('Password does not match.');
            throw new ApiError('AUTH_INVALID_CREDENTIALS');
        }

        console.log('Password matches! Generating JWT...');
        const payload: JWTPayload = { id: user.id, roles: user.roles };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions);

        const { password, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
}
