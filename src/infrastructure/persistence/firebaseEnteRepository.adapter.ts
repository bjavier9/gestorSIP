import { EnteRepository, EnteInput } from "../../domain/ports/enteRepository.port";
import { Ente } from "../../domain/ente";
import { db } from "../../config/firebase";
import { v4 as uuidv4 } from 'uuid';

export class FirebaseEnteRepository implements EnteRepository {
    private readonly collection = db.collection('entes');

    private toDomain(doc: FirebaseFirestore.DocumentSnapshot): Ente {
        const data = doc.data()!;
        return {
            id: doc.id,
            nombre: data.nombre,
            tipo: data.tipo,
            direccion: data.direccion,
            telefono: data.telefono,
            correo: data.correo,
            activo: data.activo,
            fechaCreacion: data.fechaCreacion.toDate(),
            fechaActualizacion: data.fechaActualizacion.toDate(),
            metadatos: data.metadatos,
        };
    }

    async findById(id: string): Promise<Ente | null> {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) {
            return null;
        }
        return this.toDomain(doc);
    }

    async findAll(): Promise<Ente[]> {
        const snapshot = await this.collection.get();
        return snapshot.docs.map(this.toDomain);
    }

    async save(ente: EnteInput): Promise<Ente> {
        const id = ente.id || uuidv4();
        const now = new Date();

        const newEnte = {
            ...ente,
            fechaCreacion: now,
            fechaActualizacion: now,
        };

        await this.collection.doc(id).set(newEnte);
        
        return { ...newEnte, id, fechaCreacion: now, fechaActualizacion: now };
    }

    async update(id: string, ente: Partial<EnteInput>): Promise<Ente | null> {
        const docRef = this.collection.doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return null;
        }

        const updatedData = {
            ...ente,
            fechaActualizacion: new Date(),
        };

        await docRef.update(updatedData);

        const updatedDoc = await docRef.get();
        return this.toDomain(updatedDoc);
    }

    async delete(id: string): Promise<void> {
        await this.collection.doc(id).delete();
    }
}
