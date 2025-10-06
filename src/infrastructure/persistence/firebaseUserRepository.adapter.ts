import { injectable } from 'inversify';
import { getFirestore, CollectionReference, Timestamp } from 'firebase-admin/firestore';
import { User } from '../../domain/user';
import { UserRepository } from '../../domain/ports/userRepository.port';

@injectable()
export class FirebaseUserRepositoryAdapter implements UserRepository {

    private get collection(): CollectionReference {
        return getFirestore().collection('users');
    }

    private mapDocToUser(doc: FirebaseFirestore.DocumentSnapshot): User {
        const data = doc.data();
        if (!data) {
            throw new Error(`Documento de usuario ${doc.id} sin datos.`);
        }

        const createdAt = data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : data.createdAt ?? new Date();

        return {
            id: doc.id,
            email: data.email,
            password: data.password,
            enteId: data.enteId,
            roles: Array.isArray(data.roles) ? data.roles : [],
            createdAt,
        };
    }

    async findByEmail(email: string): Promise<User | null> {
        const snapshot = await this.collection.where('email', '==', email).limit(1).get();
        if (snapshot.empty) {
            return null;
        }
        return this.mapDocToUser(snapshot.docs[0]);
    }

    async save(user: User): Promise<void> {
        const docRef = this.collection.doc(user.id);
        await docRef.set(
            {
                email: user.email,
                password: user.password,
                enteId: user.enteId,
                roles: user.roles,
                createdAt: user.createdAt ?? new Date(),
            },
            { merge: true },
        );
    }
}

