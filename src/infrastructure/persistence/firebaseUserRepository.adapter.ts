import { UserRepository } from "../../domain/ports/userRepository.port";
import { User } from "../../domain/user";
import { db } from "../../config/firebase";

export class FirebaseUserRepository implements UserRepository {
    private readonly usersCollection = db.collection('users');

    async findByEmail(email: string): Promise<User | null> {
        const snapshot = await this.usersCollection.where('email', '==', email).limit(1).get();
        if (snapshot.empty) {
            return null;
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();
        
        return {
            email: userData.email,
            password: userData.password,
            createdAt: userData.createdAt.toDate(), // Firestore timestamp to Date
        };
    }

    async save(user: Omit<User, 'createdAt'> & { createdAt?: Date }): Promise<void> {
        const userToSave = {
            ...user,
            createdAt: user.createdAt || new Date(),
        };

        // Use the email as the document ID for easy lookup and to enforce uniqueness
        await this.usersCollection.doc(user.email).set(userToSave);
    }
}
