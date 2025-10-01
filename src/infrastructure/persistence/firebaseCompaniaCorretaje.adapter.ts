import { injectable } from 'inversify';
import admin from 'firebase-admin';
import { CompaniaCorretajeRepository } from '../../domain/ports/companiaCorretajeRepository.port';
import { CompaniaCorretaje } from '../../domain/companiaCorretaje';
import { db } from '../../config/firebase';

@injectable()
export class FirebaseCompaniaCorretajeAdapter implements CompaniaCorretajeRepository {

  private get collection(): admin.firestore.CollectionReference {
    if (!db) {
      console.error('FATAL: Firestore DB is not initialized in adapter.');
      throw new Error('Firestore has not been initialized. Make sure initializeFirebase() is called on startup.');
    }
    return db.collection('companias_corretaje');
  }

  async create(companiaData: Partial<CompaniaCorretaje>): Promise<CompaniaCorretaje> {
    console.log('ADAPTER: Create method called with:', companiaData);
    const docRef = this.collection.doc();

    const newCompania = {
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

    console.log('ADAPTER: Attempting to save object to Firestore:', newCompania);

    try {
      await docRef.set(newCompania);
      console.log('ADAPTER: Document successfully written to Firestore!');
      return newCompania as CompaniaCorretaje;
    } catch (error) {
      console.error('ADAPTER CRITICAL: Firestore .set() operation failed!', error);
      throw error; // Re-throw to be caught by the global error handler
    }
  }

  async findByRif(rif: string): Promise<CompaniaCorretaje | null> {
    const snapshot = await this.collection.where('rif', '==', rif).limit(1).get();
    if (snapshot.empty) {
      return null;
    }
    return snapshot.docs[0].data() as CompaniaCorretaje;
  }
}
