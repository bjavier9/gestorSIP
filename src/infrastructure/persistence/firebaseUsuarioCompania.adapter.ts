
import { injectable } from 'inversify';
import { getFirestore, CollectionReference, Timestamp } from 'firebase-admin/firestore';
import { UsuarioCompaniaRepository } from '../../domain/ports/usuarioCompaniaRepository.port';
import { UsuarioCompania } from '../../domain/usuarioCompania';
import { ApiError } from '../../utils/ApiError';

@injectable()
export class FirebaseUsuarioCompaniaAdapter implements UsuarioCompaniaRepository {

  // Usa un getter para obtener la colección de forma perezosa (lazy).
  // Esto asegura que getFirestore() se llama solo cuando se necesita,
  // después de que Firebase se haya inicializado.
  private get collection(): CollectionReference {
    return getFirestore().collection('usuarios_companias');
  }

  constructor() {
    // El constructor ahora está vacío para evitar la inicialización temprana.
  }

  private docToUsuarioCompania(doc: FirebaseFirestore.DocumentSnapshot): UsuarioCompania {
    if (!doc.exists) {
      throw new ApiError('NOT_FOUND', 'Document not found.', 404);
    }
    const data = doc.data()!;

    const fechaCreacion = data.fechaCreacion instanceof Timestamp 
      ? data.fechaCreacion.toDate() 
      : new Date();

    return {
      id: doc.id,
      userId: data.userId,
      email: data.email,
      companiaCorretajeId: data.companiaCorretajeId,
      rol: data.rol,
      activo: data.activo,
      fechaCreacion: fechaCreacion,
      ...(data.enteId && { enteId: data.enteId }),
      ...(data.oficinaId && { oficinaId: data.oficinaId }),
    };
  }

  async create(data: Partial<UsuarioCompania>): Promise<UsuarioCompania> {
    const docRef = data.id ? this.collection.doc(String(data.id)) : this.collection.doc();
    const newAssociation = {
      ...data,
      activo: data.activo !== undefined ? data.activo : true,
      fechaCreacion: new Date(),
    };
    await docRef.set(newAssociation);
    const newDoc = await docRef.get();
    return this.docToUsuarioCompania(newDoc);
  }

  async findByUserId(userId: string): Promise<UsuarioCompania[]> {
    const snapshot = await this.collection.where('userId', '==', userId).get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => this.docToUsuarioCompania(doc));
  }

  async findByUserAndCompania(userId: string, companiaId: string): Promise<UsuarioCompania | null> {
    const snapshot = await this.collection
      .where('userId', '==', userId)
      .where('companiaCorretajeId', '==', companiaId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return this.docToUsuarioCompania(snapshot.docs[0]);
  }

  async findById(id: string): Promise<UsuarioCompania | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return this.docToUsuarioCompania(doc);
  }

  async setActive(id: string, active: boolean): Promise<UsuarioCompania> {
    const docRef = this.collection.doc(id);
    // Nota: Es más seguro obtener la instancia de la DB directamente para transacciones
    await getFirestore().runTransaction(async (tx) => {
      const snap = await tx.get(docRef);
      if (!snap.exists) {
        throw new ApiError('NOT_FOUND', 'UsuarioCompania not found.', 404);
      }
      tx.update(docRef, { activo: active });
    });
    const updated = await docRef.get();
    return this.docToUsuarioCompania(updated);
  }
}
