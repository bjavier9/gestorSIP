import { injectable } from "inversify";
import { EnteRepository, EnteInput, EnteUpdateInput } from "../../domain/ports/enteRepository.port";
import { Ente } from "../../domain/ente";
import { db } from "../../config/firebase";

@injectable()
export class FirebaseEnteRepository implements EnteRepository {
    private readonly collection = db.collection('entes');

    private toDomain(doc: FirebaseFirestore.DocumentSnapshot): Ente {
        const data = doc.data()!;
        return {
            id: doc.id,
            ...data
        } as Ente;
    }

    async findById(id: string): Promise<Ente | null> {
        const doc = await this.collection.doc(id).get();
        return doc.exists ? this.toDomain(doc) : null;
    }

    async findAll(): Promise<Ente[]> {
        const snapshot = await this.collection.get();
        return snapshot.docs.map(doc => this.toDomain(doc));
    }

    async save(data: EnteInput): Promise<Ente> {
        const docRef = this.collection.doc(); 
        const now = new Date();
        const newEnte = {
            ...data,
            fecha_creacion: now,
            fecha_actualizacion: now,
        };
        await docRef.set(newEnte);
        return { id: docRef.id, ...newEnte } as Ente;
    }

    async update(id: string, data: EnteUpdateInput): Promise<Ente> {
        const docRef = this.collection.doc(id);
        await docRef.update({ ...data, fecha_actualizacion: new Date() });
        const updatedDoc = await docRef.get();
        return this.toDomain(updatedDoc);
    }

    async delete(id: string): Promise<boolean> {
        const docRef = this.collection.doc(id);
        await docRef.delete();
        return true;
    }
}
