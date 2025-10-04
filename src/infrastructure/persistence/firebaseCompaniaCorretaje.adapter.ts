
import { injectable } from 'inversify';
import { CollectionReference, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { CompaniaCorretajeRepository } from '../../domain/ports/companiaCorretajeRepository.port';
import { CompaniaCorretaje, Creada, Modificado } from '../../domain/companiaCorretaje';
import { ApiError } from '../../utils/ApiError';

@injectable()
export class FirebaseCompaniaCorretajeAdapter implements CompaniaCorretajeRepository {
  private get collection(): CollectionReference {
    return getFirestore().collection('companias_corretaje');
  }

  constructor() {}

  private docToCompaniaCorretaje(doc: FirebaseFirestore.DocumentSnapshot): CompaniaCorretaje {
    const data = doc.data();
    if (!data) {
      throw new ApiError('INTERNAL_SERVER_ERROR', `No se pudo leer la compania ${doc.id}.`, 500);
    }

    const toDate = (timestamp: any, fieldName: string): Date => {
        if (timestamp instanceof Timestamp) {
            return timestamp.toDate();
        }
        throw new ApiError('INTERNAL_SERVER_ERROR', `El campo '${fieldName}' de la compania con ID ${doc.id} es invalido o no existe.`, 500);
    };

    const modificadoArray = (data.modificado || []).map((m: any) => ({
        ...m,
        fechaActualizacion: toDate(m.fechaActualizacion, 'modificado.fechaActualizacion')
    }));

    return {
        id: doc.id,
        nombre: data.nombre,
        rif: data.rif,
        direccion: data.direccion,
        telefono: data.telefono,
        correo: data.correo,
        fechaCreacion: toDate(data.fechaCreacion, 'fechaCreacion'),
        fechaActualizacion: toDate(data.fechaActualizacion, 'fechaActualizacion'),
        activo: data.activo,
        creada: data.creada as Creada,
        modificado: modificadoArray as Modificado[],
        monedasAceptadas: data.monedasAceptadas as string[],
        monedaPorDefecto: data.monedaPorDefecto,
        modulos: data.modulos as string[],
    };
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
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      creada: compania.creada || { idente: 0 },
      modificado: compania.modificado || [],
    };
    await docRef.set(payload);
    const created = await docRef.get();
    return this.docToCompaniaCorretaje(created);
  }

  async findByRif(rif: string): Promise<CompaniaCorretaje | null> {
    const snapshot = await this.collection.where('rif', '==', rif).limit(1).get();
    if (snapshot.empty) {
      return null;
    }
    return this.docToCompaniaCorretaje(snapshot.docs[0]);
  }

  async findById(id: string): Promise<CompaniaCorretaje | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return this.docToCompaniaCorretaje(doc);
  }

  async findFirst(): Promise<CompaniaCorretaje | null> {
    const snapshot = await this.collection.limit(1).get();
    if (snapshot.empty) {
      return null;
    }
    return this.docToCompaniaCorretaje(snapshot.docs[0]);
  }

  async update(id: string, data: Partial<CompaniaCorretaje>): Promise<CompaniaCorretaje> {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new ApiError('NOT_FOUND', `Compania ${id} no encontrada.`, 404);
    }
    await docRef.update({ ...data, fechaActualizacion: new Date() });
    const updated = await docRef.get();
    return this.docToCompaniaCorretaje(updated);
  }

  async setActive(id: string, active: boolean): Promise<CompaniaCorretaje> {
    return this.update(id, { activo: active });
  }
}
