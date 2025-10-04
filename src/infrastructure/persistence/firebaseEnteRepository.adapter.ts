import { injectable } from 'inversify';
import { getFirestore, CollectionReference, Timestamp } from 'firebase-admin/firestore';
import { Ente } from '../../domain/ente';
import { EnteRepository, EnteInput, EnteUpdateInput } from '../../domain/ports/enteRepository.port';
import { ApiError } from '../../utils/ApiError';

@injectable()
export class FirebaseEnteRepositoryAdapter implements EnteRepository {

    private get collection(): CollectionReference {
        return getFirestore().collection('entes');
    }

    constructor() {}

    private docToEnte(doc: FirebaseFirestore.DocumentSnapshot): Ente {
        const data = doc.data();

        if (!data) {
            throw new ApiError('NOT_FOUND', `El ente con ID ${doc.id} no tiene datos.`, 404);
        }

        const toDate = (timestamp: any, fieldName: string): Date => {
            if (timestamp instanceof Timestamp) {
                return timestamp.toDate();
            }
            throw new ApiError('INTERNAL_SERVER_ERROR', `El campo '${fieldName}' del ente con ID ${doc.id} es invalido o no existe.`, 500);
        };

        return {
            id: doc.id,
            nombre: data.nombre,
            tipo: data.tipo,
            documento: data.documento,
            tipo_documento: data.tipo_documento,
            direccion: data.direccion,
            telefono: data.telefono,
            correo: data.correo,
            idregion: data.idregion,
            idReferido: data.idReferido,
            fechaCreacion: toDate(data.fechaCreacion, 'fechaCreacion'),
            fechaActualizacion: toDate(data.fechaActualizacion, 'fechaActualizacion'),
            activo: data.activo,
            metadatos: data.metadatos || {},
        };
    }

    async save(data: EnteInput): Promise<Ente> {
        const newEnteData = {
            ...data,
            fechaCreacion: new Date(),
            fechaActualizacion: new Date(),
            activo: true, 
        };
        const docRef = await this.collection.add(newEnteData);
        const savedDoc = await docRef.get();
        return this.docToEnte(savedDoc);
    }

    async findByDocumento(documento: string): Promise<Ente | null> {
        const snapshot = await this.collection.where('documento', '==', documento).limit(1).get();
        if (snapshot.empty) {
            return null;
        }
        const doc = snapshot.docs[0];
        return this.docToEnte(doc);
    }

    async findAll(): Promise<Ente[]> {
        const snapshot = await this.collection.get();
        return snapshot.docs.map(doc => this.docToEnte(doc));
    }

    async findById(id: string): Promise<Ente | null> {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) return null;
        return this.docToEnte(doc);
    }

    async update(id: string, updates: EnteUpdateInput): Promise<Ente | null> {
        const docRef = this.collection.doc(id);
        const updateData = {
            ...updates,
            fechaActualizacion: new Date(),
        };
        await docRef.update(updateData);
        const updatedDoc = await docRef.get();
        return this.docToEnte(updatedDoc);
    }

    async delete(id: string): Promise<void> {
        const docRef = this.collection.doc(id);
        await docRef.delete();
    }
}
