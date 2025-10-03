
import { injectable } from 'inversify';
import { getFirestore, CollectionReference } from 'firebase-admin/firestore';
import { User } from '../../domain/user';
import { UserRepository } from '../../domain/ports/userRepository.port';

@injectable()
export class FirebaseUserRepositoryAdapter implements UserRepository {

    private get collection(): CollectionReference {
        return getFirestore().collection('users');
    }

    constructor() {}

    async findByEmail(email: string): Promise<User | null> {
        const snapshot = await this.collection.where('email', '==', email).limit(1).get();
        if (snapshot.empty) {
            return null;
        }
        const doc = snapshot.docs[0];
        const data = doc.data();
        return {
            id: doc.id,
            uid: data.uid,
            email: data.email,
            role: data.role,
            companiaCorretajeId: data.companiaCorretajeId
        };
    }

    async findById(id: string): Promise<User | null> {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) {
            return null;
        }
        const data = doc.data()!;
        return {
            id: doc.id,
            uid: data.uid,
            email: data.email,
            role: data.role,
            companiaCorretajeId: data.companiaCorretajeId
        };
    }

    async createUser(user: User): Promise<User> {
        const docRef = this.collection.doc(user.uid); // Use Firebase Auth UID as the document ID
        await docRef.set(user);
        return user;
    }
}
