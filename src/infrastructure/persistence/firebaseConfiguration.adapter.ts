
import { injectable } from 'inversify';
import { getFirestore, CollectionReference } from 'firebase-admin/firestore';
import { ConfigurationRepository } from '../../domain/ports/configurationRepository.port';
import { Configuration } from '../../domain/configuration';
import { ApiError } from '../../utils/ApiError';

@injectable()
export class FirebaseConfigurationAdapter implements ConfigurationRepository {

    // Utiliza un getter para asegurar que getFirestore() se llama después de la inicialización.
    private get collection(): CollectionReference {
        return getFirestore().collection('configurations');
    }

    constructor() {
        // El constructor se deja vacío para evitar la inicialización temprana.
    }

    async findAll(): Promise<Configuration[]> {
        const snapshot = await this.collection.get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Configuration));
    }

    async findById(id: string): Promise<Configuration | null> {
        const docRef = this.collection.doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return null;
        }
        return {
            id: doc.id,
            ...doc.data()
        } as Configuration;
    }

    async create(configuration: Configuration): Promise<Configuration> {
        const { id, ...configData } = configuration;
        const docRef = this.collection.doc(id);
        await docRef.set(configData);
        return configuration;
    }

    async update(id: string, configurationData: Partial<Configuration>): Promise<Configuration | null> {
        const docRef = this.collection.doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return null;
        }
        await docRef.update(configurationData);
        const updatedDoc = await docRef.get();
        return {
            id: updatedDoc.id,
            ...updatedDoc.data()
        } as Configuration;
    }
}
