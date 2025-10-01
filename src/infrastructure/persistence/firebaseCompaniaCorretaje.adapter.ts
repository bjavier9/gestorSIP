import { injectable } from 'inversify';
import { CompaniaCorretajeRepository } from '../../domain/ports/companiaCorretajeRepository.port';
import { CompaniaCorretaje } from '../../domain/companiaCorretaje';
import { firestore } from '../../config/firebase';

@injectable()
export class FirebaseCompaniaCorretajeAdapter implements CompaniaCorretajeRepository {
  private readonly collection = firestore.collection('companias_corretaje');

  async create(compania: CompaniaCorretaje): Promise<CompaniaCorretaje> {
    const docRef = this.collection.doc();
    const newCompania = {
      ...compania,
      id: docRef.id,
    };
    await docRef.set(newCompania);
    return newCompania;
  }
}
