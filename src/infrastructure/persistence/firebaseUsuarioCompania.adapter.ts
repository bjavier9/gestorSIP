
// src/infrastructure/persistence/firebaseUsuarioCompania.adapter.ts

import { injectable } from 'inversify';
import { getFirestore, Firestore, CollectionReference, QuerySnapshot } from 'firebase-admin/firestore';
import { UsuarioCompaniaRepository } from '../../domain/ports/usuarioCompaniaRepository.port';
import { UsuarioCompania } from '../../domain/usuarioCompania';
import { ApiError }   from '../../utils/ApiError';

@injectable()
export class FirebaseUsuarioCompaniaAdapter implements UsuarioCompaniaRepository {
  private readonly db: Firestore;
  private readonly collection: CollectionReference;

  constructor() {
    this.db = getFirestore();
    this.collection = this.db.collection('usuarios_companias');
  }

  private docToUsuarioCompania(doc: FirebaseFirestore.QueryDocumentSnapshot): UsuarioCompania {
    if (!doc.exists) {
      throw new ApiError('NOT_FOUND', 'Document not found.', 404);
    }
    const data = doc.data();
    return {
      id: doc.id,
      enteId: data.enteId,
      companiaCorretajeId: data.companiaCorretajeId, // Reverted to the correct field name
      oficinaId: data.oficinaId,
      rol: data.rol,
      activo: data.activo,
    };
  }

  async findByUserId(userId: string): Promise<UsuarioCompania[]> {
    // In Firestore, the document ID is the user's UID for this collection
    const doc = await this.collection.doc(userId).get();
    if (!doc.exists) {
        // To support users in multiple companies, we query by a `userId` field.
        // This assumes the schema might have a dedicated userId field if the doc ID isn't the UID.
        const snapshot = await this.collection.where('id', '==', userId).get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(d => this.docToUsuarioCompania(d));
    }
    return [this.docToUsuarioCompania(doc as FirebaseFirestore.QueryDocumentSnapshot)];
  }

  async findByUserAndCompania(userId: string, companiaId: string): Promise<UsuarioCompania | null> {
    const snapshot = await this.collection
      .where('id', '==', userId)
      .where('companiaCorretajeId', '==', companiaId) // Reverted to the correct field name
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return this.docToUsuarioCompania(snapshot.docs[0]);
  }
}
