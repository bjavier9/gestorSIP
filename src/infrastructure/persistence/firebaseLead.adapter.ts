import { injectable } from 'inversify';
import { getFirestore, CollectionReference } from 'firebase-admin/firestore';
import { Lead } from '../../domain/lead';
import { LeadRepository } from '../../domain/ports/leadRepository.port';
import { ApiError } from '../../utils/ApiError';

@injectable()
export class FirebaseLeadAdapter implements LeadRepository {
  private readonly collectionName = 'leads';

  private getCollection(companiaId: string): CollectionReference {
    return getFirestore().collection('companias_corretaje').doc(companiaId).collection(this.collectionName);
  }

  private docToLead(doc: FirebaseFirestore.DocumentSnapshot): Lead {
    const data = doc.data();
    if (!data) throw new ApiError('INTERNAL_SERVER_ERROR', 'Document data is missing', 500);
    return {
      id: doc.id,
      ...data,
      fechaCreacion: data.fechaCreacion.toDate(),
      fechaActualizacion: data.fechaActualizacion.toDate(),
    } as Lead;
  }

  async create(leadData: Omit<Lead, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<Lead> {
    const collectionRef = this.getCollection(leadData.companiaCorretajeId);
    const docRef = collectionRef.doc();
    const now = new Date();
    const newLead = {
      ...leadData,
      id: docRef.id,
      fechaCreacion: now,
      fechaActualizacion: now,
    };
    await docRef.set(newLead);
    const created = await docRef.get();
    return this.docToLead(created);
  }

  async findAllByCompania(companiaId: string): Promise<Lead[]> {
    const snapshot = await this.getCollection(companiaId).get();
    return snapshot.docs.map(doc => this.docToLead(doc));
  }

  async findById(id: string): Promise<Lead | null> {
    const snapshot = await getFirestore().collectionGroup(this.collectionName).where('id', '==', id).limit(1).get();
    if (snapshot.empty) {
      return null;
    }
    return this.docToLead(snapshot.docs[0]);
  }

  async update(id: string, updates: Partial<Lead>): Promise<Lead> {
    const lead = await this.findById(id);
    if (!lead) {
      throw new ApiError('NOT_FOUND', 'Lead no encontrado.', 404);
    }

    const docRef = this.getCollection(lead.companiaCorretajeId).doc(id);
    await docRef.update({ ...updates, fechaActualizacion: new Date() });

    const updatedDoc = await docRef.get();
    return this.docToLead(updatedDoc);
  }

  async delete(id: string): Promise<void> {
    const lead = await this.findById(id);
    if (lead) {
      await this.getCollection(lead.companiaCorretajeId).doc(id).delete();
    }
  }
}
