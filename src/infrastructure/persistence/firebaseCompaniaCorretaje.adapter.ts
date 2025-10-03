import { injectable } from 'inversify';
import { CollectionReference, getFirestore } from 'firebase-admin/firestore';
import { CompaniaCorretajeRepository } from '../../domain/ports/companiaCorretajeRepository.port';
import { CompaniaCorretaje } from '../../domain/companiaCorretaje';
import { ApiError } from '../../utils/ApiError';

@injectable()
export class FirebaseCompaniaCorretajeAdapter implements CompaniaCorretajeRepository {
  private get collection(): CollectionReference {
    return getFirestore().collection('companias_corretaje');
  }

  constructor() {}

  private toDomain(doc: FirebaseFirestore.DocumentSnapshot): CompaniaCorretaje {
    const data = doc.data();
    if (!data) {
      throw new ApiError('INTERNAL_SERVER_ERROR', `No se pudo leer la compania ${doc.id}.`, 500);
    }
    return { id: doc.id, ...(data as CompaniaCorretaje) };
  }

  async create(compania: Partial<CompaniaCorretaje>): Promise<CompaniaCorretaje> {
    const docRef = this.collection.doc();
    const payload = {
      nombre: compania.nombre || '',
      rif: compania.rif || '',
      direccion: compania.direccion || '',
      telefono: compania.telefono || '',
      correo: compania.correo || '',
      monedasAceptadas: compania.monedasAceptadas || [],
      monedaPorDefecto: compania.monedaPorDefecto || '',
      modulos: compania.modulos || [],
      activo: compania.activo !== undefined ? compania.activo : true,
      fechaCreacion: compania.fechaCreacion || new Date(),
      fechaActualizacion: compania.fechaActualizacion || new Date(),
      creada: compania.creada || { idente: 0 },
      modificado: compania.modificado || [],
    };
    await docRef.set(payload);
    const created = await docRef.get();
    return this.toDomain(created);
  }

  async findByRif(rif: string): Promise<CompaniaCorretaje | null> {
    const snapshot = await this.collection.where('rif', '==', rif).limit(1).get();
    if (snapshot.empty) {
      return null;
    }
    return this.toDomain(snapshot.docs[0]);
  }

  async findById(id: string): Promise<CompaniaCorretaje | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return this.toDomain(doc);
  }

  async findFirst(): Promise<CompaniaCorretaje | null> {
    const snapshot = await this.collection.limit(1).get();
    if (snapshot.empty) {
      return null;
    }
    return this.toDomain(snapshot.docs[0]);
  }

  async update(id: string, data: Partial<CompaniaCorretaje>): Promise<CompaniaCorretaje> {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new ApiError('NOT_FOUND', `Compania ${id} no encontrada.`, 404);
    }
    await docRef.update({ ...data, fechaActualizacion: new Date() });
    const updated = await docRef.get();
    return this.toDomain(updated);
  }

  async setActive(id: string, active: boolean): Promise<CompaniaCorretaje> {
    return this.update(id, { activo: active });
  }
}
