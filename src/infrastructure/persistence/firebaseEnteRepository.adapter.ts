
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
            throw new ApiError('INTERNAL_SERVER_ERROR', `Failed to parse data for document ${doc.id}.`, 500);
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
            Logger.error(`[FirebaseEnteRepository] Error finding ente by id: ${id}.`, { error });
            throw new ApiError('INTERNAL_SERVER_ERROR', 'Database query failed.', 500, error);
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
            Logger.error(`[FirebaseEnteRepository] Error finding ente by documento: ${documento}.`, { error });
            throw new ApiError('INTERNAL_SERVER_ERROR', `Database query failed for documento ${documento}.`, 500, error);
        }
    }

    async findAll(): Promise<Ente[]> {
        Logger.debug(`[FirebaseEnteRepository] Attempting to find all entes.`);
        try {
            const snapshot = await this.collection.get();
            Logger.debug(`[FirebaseEnteRepository] Successfully found ${snapshot.size} entes.`);
            return snapshot.docs.map(doc => this.toDomain(doc));
        } catch (error) {
            Logger.error(`[FirebaseEnteRepository] Error finding all entes.`, { error });
            throw new ApiError('INTERNAL_SERVER_ERROR', 'Database query failed.', 500, error);
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
            const savedDoc = await docRef.get();
            return this.toDomain(savedDoc);
        } catch (error) {
            Logger.error(`[FirebaseEnteRepository] Error saving new ente.`, { error });
            throw new ApiError('INTERNAL_SERVER_ERROR', 'Database insert failed.', 500, error);
        }
    }

    async update(id: string, data: EnteUpdateInput): Promise<Ente> {
        Logger.debug(`[FirebaseEnteRepository] Attempting to update ente with id: ${id}.`);
        const docRef = this.collection.doc(id);
        try {
            await db.runTransaction(async (transaction) => {
                const doc = await transaction.get(docRef);
                if (!doc.exists) {
                    throw new ApiError('ENTE_NOT_FOUND', `Ente with id: ${id} not found for update.`, 404);
                }
                transaction.update(docRef, { ...data, fecha_actualizacion: new Date() });
            });

            const updatedDoc = await docRef.get();
            return this.toDomain(updatedDoc);
        } catch (error) {
            if (error instanceof ApiError && error.errorKey === 'ENTE_NOT_FOUND') {
                throw error;
            }
            Logger.error(`[FirebaseEnteRepository] Error updating ente with id: ${id}.`, { error });
            throw new ApiError('INTERNAL_SERVER_ERROR', `Database transaction failed for ente ${id}.`, 500, error);
        }
    }

    async delete(id: string): Promise<void> {
        Logger.debug(`[FirebaseEnteRepository] Attempting to delete ente with id: ${id}.`);
        try {
            const docRef = this.collection.doc(id);

            const doc = await docRef.get();
            if (!doc.exists) {
                throw new ApiError('ENTE_NOT_FOUND', `Ente with id: ${id} not found for deletion.`, 404);
            }

            await docRef.delete();
            Logger.debug(`[FirebaseEnteRepository] Successfully deleted ente with id: ${id}.`);
        } catch (error) {
            if (error instanceof ApiError && error.errorKey === 'ENTE_NOT_FOUND') {
                throw error;
            }
            Logger.error(`[FirebaseEnteRepository] Error deleting ente with id: ${id}.`, { error });
            throw new ApiError('INTERNAL_SERVER_ERROR', `Database delete failed for ente ${id}.`, 500, error);
        }
    }
}
