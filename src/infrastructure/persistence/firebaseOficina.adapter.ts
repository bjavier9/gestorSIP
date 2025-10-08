
import { injectable } from 'inversify';
import { getFirestore, CollectionReference, Timestamp } from 'firebase-admin/firestore';
import { Oficina } from '../../domain/entities/oficina';
import { OficinaRepository } from '../../domain/ports/oficinaRepository.port';
import { ApiError } from '../../utils/ApiError';

@injectable()
export class FirebaseOficinaAdapter implements OficinaRepository {

    private get companiaCollection(): CollectionReference {
        return getFirestore().collection('companias_corretaje');
    }

    constructor() {}

    private getOficinasCollection(companiaId: string): CollectionReference {
        if (!companiaId) {
            throw new ApiError('BAD_REQUEST', 'El ID de la compañía es requerido para operar con oficinas.', 400);
        }
        return this.companiaCollection.doc(companiaId).collection('oficinas');
    }

    private docToOficina(doc: FirebaseFirestore.DocumentSnapshot): Oficina {
        const data = doc.data();
        if (!data) {
            throw new ApiError('INTERNAL_SERVER_ERROR', 'Document data is missing.', 500);
        }

        const fechaCreacion = data.fechaCreacion instanceof Timestamp ? data.fechaCreacion.toDate() : new Date();
        const fechaActualizacion = data.fechaActualizacion instanceof Timestamp ? data.fechaActualizacion.toDate() : new Date();

        // CORREGIDO: El objeto ahora se alinea con la interfaz Oficina del dominio.
        return {
            id: doc.id,
            companiaCorretajeId: data.companiaCorretajeId,
            nombre: data.nombre,
            direccion: data.direccion,
            telefono: data.telefono, // Corregido de 'telefonos' a 'telefono'
            moneda: data.moneda, // Añadido campo faltante
            activo: data.activo,
            fechaCreacion,
            fechaActualizacion,
        };
    }

    async create(oficinaData: Omit<Oficina, 'id'>): Promise<Oficina> {
        const { companiaCorretajeId } = oficinaData;
        const oficinasCollection = this.getOficinasCollection(companiaCorretajeId);
        
        const docRef = oficinasCollection.doc();
        const newOficina: Oficina = {
            id: docRef.id,
            ...oficinaData,
            fechaCreacion: new Date(),
            fechaActualizacion: new Date(),
        };

        await docRef.set(newOficina);
        return newOficina;
    }

    async update(id: string, updates: Partial<Oficina>): Promise<Oficina | null> {
        if (!updates.companiaCorretajeId) {
             throw new ApiError('BAD_REQUEST', 'El companiaCorretajeId es requerido para actualizar la oficina.', 400);
        }

        const oficinasCollection = this.getOficinasCollection(updates.companiaCorretajeId);
        const docRef = oficinasCollection.doc(id);
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
        return this.docToOficina(updatedDoc);
    }

    async findAll(companiaId: string): Promise<Oficina[]> {
        const snapshot = await this.getOficinasCollection(companiaId).get();
        return snapshot.docs.map(doc => this.docToOficina(doc));
    }

    async findById(companiaId: string, oficinaId: string): Promise<Oficina | null> {
        const doc = await this.getOficinasCollection(companiaId).doc(oficinaId).get();
        return doc.exists ? this.docToOficina(doc) : null;
    }

    async delete(companiaId: string, oficinaId: string): Promise<boolean> {
        await this.getOficinasCollection(companiaId).doc(oficinaId).delete();
        return true;
    }
}
