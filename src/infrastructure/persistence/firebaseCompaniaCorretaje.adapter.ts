
import { injectable } from 'inversify';
import { CollectionReference } from 'firebase-admin/firestore';
import { CompaniaCorretajeRepository } from '../../domain/ports/companiaCorretajeRepository.port';
import { CompaniaCorretaje } from '../../domain/companiaCorretaje';
import { db } from '../../config/firebase';

@injectable()
export class FirebaseCompaniaCorretajeAdapter implements CompaniaCorretajeRepository {
  private readonly collection: CollectionReference;

  constructor() {
    if (!db) {
      throw new Error('Firestore has not been initialized. Make sure initializeFirebase() is called on startup.');
    }
    this.collection = db.collection('companias_corretaje');
  }

  async create(companiaData: Partial<CompaniaCorretaje>): Promise<CompaniaCorretaje> {
    const docRef = this.collection.doc();

    const newCompania: CompaniaCorretaje = {
      id: docRef.id,
      nombre: companiaData.nombre || '',
      rif: companiaData.rif || '',
      direccion: companiaData.direccion || '',
      telefono: companiaData.telefono || '',
      correo: companiaData.correo || '',
      monedasAceptadas: companiaData.monedasAceptadas || [],
      monedaPorDefecto: companiaData.monedaPorDefecto || '',
      modulos: companiaData.modulos || [],
      activo: companiaData.activo !== undefined ? companiaData.activo : true,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      creada: companiaData.creada || { idente: 0 },
      modificado: companiaData.modificado || [],
    };

    await docRef.set(newCompania);
    return newCompania;
  }

  async findByRif(rif: string): Promise<CompaniaCorretaje | null> {
    const snapshot = await this.collection.where('rif', '==', rif).limit(1).get();
    if (snapshot.empty) {
      return null;
    }
    return snapshot.docs[0].data() as CompaniaCorretaje;
  }

  async findFirst(): Promise<CompaniaCorretaje | null> {
    const snapshot = await this.collection.limit(1).get();
    if (snapshot.empty) {
      return null;
    }
    return snapshot.docs[0].data() as CompaniaCorretaje;
  }
}
