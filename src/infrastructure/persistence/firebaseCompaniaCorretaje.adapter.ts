
import { injectable } from 'inversify';
import { getFirestore, CollectionReference, DocumentReference } from 'firebase-admin/firestore';
import { CompaniaCorretaje } from '../../domain/companiaCorretaje';
import { CompaniaCorretajeRepository } from '../../domain/ports/companiaCorretajeRepository.port';
import { ApiError } from '../../utils/ApiError';

@injectable()
export class FirebaseCompaniaCorretajeAdapter implements CompaniaCorretajeRepository {

    private get collection(): CollectionReference {
        return getFirestore().collection('companias_corretaje');
    }

    constructor() {}

    private docToCompania(doc: FirebaseFirestore.DocumentSnapshot): CompaniaCorretaje {
        const data = doc.data();
        if (!data) throw new ApiError('INTERNAL_SERVER_ERROR', 'Document data is missing.', 500);
        return {
            id: doc.id,
            ...data
        } as CompaniaCorretaje;
    }

    async findAll(): Promise<CompaniaCorretaje[]> {
        const snapshot = await this.collection.get();
        return snapshot.docs.map(doc => this.docToCompania(doc));
    }

    async findById(id: string): Promise<CompaniaCorretaje | null> {
        const doc = await this.collection.doc(id).get();
        return doc.exists ? this.docToCompania(doc) : null;
    }

    async create(compania: Omit<CompaniaCorretaje, 'id'>): Promise<CompaniaCorretaje> {
        const docRef = this.collection.doc();
        await docRef.set(compania);
        return { id: docRef.id, ...compania } as CompaniaCorretaje;
    }

    async update(id: string, updates: Partial<CompaniaCorretaje>): Promise<CompaniaCorretaje | null> {
        const docRef = this.collection.doc(id);
        const doc = await docRef.get();
        if (!doc.exists) return null;

        await docRef.update(updates);
        const updatedDoc = await docRef.get();
        return this.docToCompania(updatedDoc);
    }

    async delete(id: string): Promise<boolean> {
        const docRef = this.collection.doc(id);
        await docRef.delete();
        return true;
    }
}
