
import { injectable } from 'inversify';
import { CollectionReference, Timestamp } from 'firebase-admin/firestore';
import { UsuarioCompaniaRepository } from '../../domain/ports/usuarioCompaniaRepository.port';
import { UsuarioCompania } from '../../domain/usuarioCompania';
import { ApiError } from '../../utils/ApiError';
import { db } from '../../config/firebase';

@injectable()
export class FirebaseUsuarioCompaniaAdapter implements UsuarioCompaniaRepository {
  private readonly collection: CollectionReference;

  constructor() {
    this.collection = db.collection('usuarios_companias');
  }

  private docToUsuarioCompania(doc: FirebaseFirestore.DocumentSnapshot): UsuarioCompania {
    if (!doc.exists) {
      throw new ApiError('NOT_FOUND', 'Document not found.', 404);
    }
    const data = doc.data()!;

    // Securely convert timestamp to Date
    const fechaCreacion = data.fechaCreacion instanceof Timestamp 
      ? data.fechaCreacion.toDate() 
      : new Date(); // Fallback to current date

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
    const docRef = this.collection.doc();
    const newAssociation = {
      ...data,
      activo: data.activo !== undefined ? data.activo : true,
      fechaCreacion: new Date(), // Set creation date on new document
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
}
