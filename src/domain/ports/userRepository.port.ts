import { User } from "../user";

export interface UserRepository {
    findByEmail(email: string): Promise<User | null>;
    save(user: Omit<User, 'createdAt'> & { createdAt?: Date }): Promise<void>;
}
