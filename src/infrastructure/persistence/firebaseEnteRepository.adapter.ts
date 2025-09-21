import { injectable } from "inversify";
import { EnteRepository, EnteInput, EnteUpdateInput } from "../../domain/ports/enteRepository.port";
import { Ente } from "../../domain/ente";
import { db } from "../../config/firebase";
import Logger from "../../config/logger";
import { ApiError } from "../../utils/ApiError";

@injectable()
export class FirebaseEnteRepository implements EnteRepository {
    private readonly collection = db.collection('entes');

    private toDomain(doc: FirebaseFirestore.DocumentSnapshot): Ente {
        const data = doc.data();
        if (!data) {
            throw new ApiError('INTERNAL_SERVER_ERROR', 'Failed to parse data for doc id.');
        }
        return {
            id: doc.id,
            ...data
        } as Ente;
    }

    async findById(id: string): Promise<Ente | null> {
        Logger.debug(`[FirebaseEnteRepository] Attempting to find ente by id: ${id}`);
        try {
            const doc = await this.collection.doc(id).get();
            if (!doc.exists) {
                Logger.debug(`[FirebaseEnteRepository] Ente with id: ${id} not found.`);
                return null;
            }
            Logger.debug(`[FirebaseEnteRepository] Successfully found ente with id: ${id}.`);
            return this.toDomain(doc);
        } catch (error) {
            throw new ApiError('INTERNAL_SERVER_ERROR', 'Database query failed.', error);
        }
    }

    async findByDocumento(documento: string): Promise<Ente | null> {
        Logger.debug(`[FirebaseEnteRepository] Attempting to find ente by documento: ${documento}`);
        try {
            const snapshot = await this.collection.where('documento', '==', documento).limit(1).get();
            if (snapshot.empty) {
                Logger.debug(`[FirebaseEnteRepository] Ente with documento: ${documento} not found.`);
                return null;
            }
            Logger.debug(`[FirebaseEnteRepository] Successfully found ente with documento: ${documento}.`);
            return this.toDomain(snapshot.docs[0]);
        } catch (error) {
            throw new ApiError('INTERNAL_SERVER_ERROR', `Database query failed for documento ${documento}.`, error);
        }
    }

    async findAll(): Promise<Ente[]> {
        Logger.debug(`[FirebaseEnteRepository] Attempting to find all entes.`);
        try {
            const snapshot = await this.collection.get();
            Logger.debug(`[FirebaseEnteRepository] Successfully found ${snapshot.size} entes.`);
            return snapshot.docs.map(doc => this.toDomain(doc));
        } catch (error) {
            throw new ApiError('INTERNAL_SERVER_ERROR', 'Database query failed.', error);
        }
    }

    async save(data: EnteInput): Promise<Ente> {
        Logger.debug(`[FirebaseEnteRepository] Attempting to save new ente.`);
        try {
            const docRef = this.collection.doc();
            const now = new Date();
            const newEnte = {
                ...data,
                fecha_creacion: now,
                fecha_actualizacion: now,
            };
            await docRef.set(newEnte);
            Logger.debug(`[FirebaseEnteRepository] Successfully saved new ente with id: ${docRef.id}.`);
            return { id: docRef.id, ...newEnte } as Ente;
        } catch (error) {
            throw new ApiError('INTERNAL_SERVER_ERROR', 'Database insert failed.', error);
        }
    }

    async update(id: string, data: EnteUpdateInput): Promise<Ente | null> {
        Logger.debug(`[FirebaseEnteRepository] Attempting to update ente with id: ${id}.`);
        const docRef = this.collection.doc(id);
        try {
            // Firestore transactions are a safe way to read-and-write.
            return await db.runTransaction(async (transaction) => {
                const doc = await transaction.get(docRef);
                if (!doc.exists) {
                    Logger.warn(`[FirebaseEnteRepository] Attempted to update non-existent ente with id: ${id}.`);
                    return null;
                }
                transaction.update(docRef, { ...data, fecha_actualizacion: new Date() });
                // After the transaction commits, we can return the updated object.
                // We construct it manually to avoid a second read.
                const updatedData = { ...doc.data(), ...data };
                return {
                    id: doc.id,
                    ...updatedData
                } as Ente;
            });
        } catch (error) {
            Logger.error(`[FirebaseEnteRepository] Error updating ente with id: ${id}.`, { error });
            // On any transaction error, return null as per the interface contract.
            return null;
        }
    }

    async delete(id: string): Promise<boolean> {
        Logger.debug(`[FirebaseEnteRepository] Attempting to delete ente with id: ${id}.`);
        try {
            const docRef = this.collection.doc(id);
            await docRef.delete();
            Logger.debug(`[FirebaseEnteRepository] Successfully deleted ente with id: ${id}.`);
            return true;
        } catch (error) {
            Logger.error(`[FirebaseEnteRepository] Error deleting ente with id: ${id}.`, { error });
            return false;
        }
    }
}
