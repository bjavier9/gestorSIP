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

    private docToEnte(doc: FirebaseFirestore.DocumentSnapshot): Ente {
        const data = doc.data();
        if (!data) {
            throw new ApiError('INTERNAL_SERVER_ERROR', `Error inesperado: el documento con ID ${doc.id} no tiene datos.`, 500);
        }

        if (!data.companiaCorretajeId) {
            throw new ApiError('INTERNAL_SERVER_ERROR', `El ente con ID ${doc.id} no tiene compañía asociada.`, 500);
        }

        const toDate = (timestamp: any, fieldName: string): Date => {
            if (timestamp instanceof Timestamp) {
                return timestamp.toDate();
            }
            if (timestamp instanceof Date) {
                return timestamp;
            }
            throw new ApiError('INTERNAL_SERVER_ERROR', `El campo '${fieldName}' del ente con ID ${doc.id} tiene un formato de fecha invalido.`, 500);
        };

        return {
            id: doc.id,
            companiaCorretajeId: data.companiaCorretajeId,
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
        } as Ente;
    }

    async save(data: EnteInput): Promise<Ente> {
        if (!data.companiaCorretajeId) {
            throw new ApiError('VALIDATION_MISSING_FIELD', 'companiaCorretajeId es requerido para crear un ente.', 400);
        }

        const now = new Date();
        const newEnteData = {
            ...data,
            fechaCreacion: now,
            fechaActualizacion: now,
            activo: data.activo !== undefined ? data.activo : true,
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
        return this.docToEnte(snapshot.docs[0]);
    }

    async findAllByCompania(companiaCorretajeId: string): Promise<Ente[]> {
        const snapshot = await this.collection.where('companiaCorretajeId', '==', companiaCorretajeId).get();
        return snapshot.docs.map(doc => this.docToEnte(doc));
    }

    async findById(id: string): Promise<Ente | null> {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) {
            return null;
        }
        return this.docToEnte(doc);
    }

    async update(id: string, updates: EnteUpdateInput): Promise<Ente | null> {
        const docRef = this.collection.doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return null;
        }

        if (updates.companiaCorretajeId && updates.companiaCorretajeId !== doc.data()?.companiaCorretajeId) {
            throw new ApiError('FORBIDDEN', 'No es posible cambiar la compañía asociada del ente.', 403);
        }

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
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new ApiError('NOT_FOUND', `El ente con ID ${id} no fue encontrado para eliminar.`, 404);
        }

        await docRef.delete();
    }
}
