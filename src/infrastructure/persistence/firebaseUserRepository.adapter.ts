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
        
        // FIX: Construct the full User object, matching the interface
        return {
            id: userDoc.id, // The document ID is the User ID
            email: userData.email,
            password: userData.password,
            enteId: userData.enteId,
            roles: userData.roles,
            createdAt: userData.createdAt.toDate(),
        };
    }

    async save(user: Omit<User, 'createdAt'> & { createdAt?: Date }): Promise<void> {
        const userToSave = {
            ...user,
            createdAt: user.createdAt || new Date(),
        };

        // FIX: Use the user's ID as the document ID for data consistency
        await this.usersCollection.doc(user.id).set(userToSave);
    }
}
