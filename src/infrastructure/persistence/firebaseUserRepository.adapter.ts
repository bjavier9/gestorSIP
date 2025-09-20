import { injectable } from "inversify";
import { UserRepository } from "../../domain/ports/userRepository.port";
import { User } from "../../domain/user";
import { db } from "../../config/firebase";

@injectable()
export class FirebaseUserRepository implements UserRepository {
    private readonly collection = db.collection('usuarios_companias');

    async findByEmail(email: string): Promise<User | null> {
        const snapshot = await this.collection.where('email', '==', email).limit(1).get();
        if (snapshot.empty) return null;

        const doc = snapshot.docs[0];
        const data = doc.data();

        return {
            id: doc.id,
            email: data.email,
            password: data.password,
            enteId: data.enteId,
            roles: data.roles,
            createdAt: data.createdAt.toDate(),
        };
    }

    async save(user: User): Promise<void> {
        const { id, ...data } = user;
        await this.collection.doc(id).set(data);
    }
}
