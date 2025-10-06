import { injectable } from 'inversify';
import { getFirestore, CollectionReference, Query, Timestamp } from 'firebase-admin/firestore';
import { Lead } from '../../domain/lead';
import { LeadRepository } from '../../domain/ports/leadRepository.port';
import { ApiError } from '../../utils/ApiError';

type FirestoreLead = Omit<Lead, 'fechaCreacion' | 'fechaActualizacion'> & {
  fechaCreacion: Date | Timestamp;
  fechaActualizacion: Date | Timestamp;
};

@injectable()
export class FirebaseLeadAdapter implements LeadRepository {
  private readonly db = getFirestore();
  private readonly collection: CollectionReference<FirestoreLead> = this.db.collection('leads') as CollectionReference<FirestoreLead>;

  private toDate(value: Date | Timestamp): Date {
    return value instanceof Date ? value : value.toDate();
  }

  private docToLead(doc: FirebaseFirestore.DocumentSnapshot<FirestoreLead>): Lead {
    const data = doc.data();
    if (!data) {
      throw new ApiError('INTERNAL_SERVER_ERROR', `No se pudo leer el lead ${doc.id}.`, 500);
    }

    const { fechaCreacion, fechaActualizacion, ...rest } = data;

    return {
      ...rest,
      id: doc.id,
      fechaCreacion: this.toDate(fechaCreacion),
      fechaActualizacion: this.toDate(fechaActualizacion),
    } as Lead;
  }

  async create(leadData: Omit<Lead, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<Lead> {
    const docRef = this.collection.doc();
    const now = new Date();
    const payload: FirestoreLead = {
      ...(leadData as FirestoreLead),
      id: docRef.id,
      fechaCreacion: now,
      fechaActualizacion: now,
    };

    await docRef.set(payload);
    const created = await docRef.get();
    return this.docToLead(created);
  }

  async findAllByCompania(companiaId: string): Promise<Lead[]> {
    const snapshot = await (this.collection as unknown as Query<FirestoreLead>)
      .where('companiaCorretajeId', '==', companiaId)
      .get();
    return snapshot.docs.map((doc) => this.docToLead(doc));
  }

  async findById(id: string): Promise<Lead | null> {
    const doc = await this.collection.doc(id).get();
    return doc.exists ? this.docToLead(doc) : null;
  }

  async update(id: string, updates: Partial<Lead>): Promise<Lead> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new ApiError('NOT_FOUND', 'Lead no encontrado.', 404);
    }

    await this.collection.doc(id).update({
      ...(updates as Partial<FirestoreLead>),
      fechaActualizacion: new Date(),
    });

    const updatedDoc = await this.collection.doc(id).get();
    return this.docToLead(updatedDoc);
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }
}
