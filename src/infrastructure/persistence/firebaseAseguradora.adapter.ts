
import { injectable } from 'inversify';
import { getFirestore, CollectionReference, Timestamp } from 'firebase-admin/firestore';
import { Aseguradora } from '../../domain/entities/aseguradora';
import { AseguradoraRepository } from '../../domain/ports/aseguradoraRepository.port';
import { ApiError } from '../../utils/ApiError';

@injectable()
export class FirebaseAseguradoraAdapter implements AseguradoraRepository {

    private get collection(): CollectionReference {
        return getFirestore().collection('aseguradoras');
    }

    constructor() {}

    private docToAseguradora(doc: FirebaseFirestore.DocumentSnapshot): Aseguradora {
        const data = doc.data();
        if (!data) {
            throw new ApiError('INTERNAL_SERVER_ERROR', 'Document data is missing.');
        }
        return {
            id: doc.id,
            nombre: data.nombre,
            codigo: data.codigo,
            direccion: data.direccion,
            telefono: data.telefono,
            correo: data.correo,
            rating: data.rating,
            activo: data.activo,
            fechaCreacion: (data.fechaCreacion as Timestamp).toDate(),
            fechaActualizacion: (data.fechaActualizacion as Timestamp).toDate(),
        };
    }

    async create(aseguradoraData: Omit<Aseguradora, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<Aseguradora> {
        const docRef = this.collection.doc();
        const newAseguradora: Aseguradora = {
            id: docRef.id,
            ...aseguradoraData,
            fechaCreacion: new Date(),
            fechaActualizacion: new Date(),
        };
        await docRef.set(newAseguradora);
        return newAseguradora;
    }

    async findAll(): Promise<Aseguradora[]> {
        const snapshot = await this.collection.where('activo', '==', true).get();
        return snapshot.docs.map(doc => this.docToAseguradora(doc));
    }

    async findById(id: string): Promise<Aseguradora | null> {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) {
            return null;
        }
        const aseguradora = this.docToAseguradora(doc);
        return aseguradora.activo ? aseguradora : null;
    }

    async update(id: string, updates: Partial<Omit<Aseguradora, 'id' | 'fechaCreacion'>>): Promise<Aseguradora | null> {
        const docRef = this.collection.doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return null;
        }
        const updateData = {
            ...updates,
            fechaActualizacion: new Date(),
        };
        await docRef.update(updateData);
        const updatedDoc = await docRef.get();
        return this.docToAseguradora(updatedDoc);
    }
}
