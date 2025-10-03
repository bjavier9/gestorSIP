import { injectable } from 'inversify';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { GestionRepository, GestionCreateInput, GestionUpdateInput } from '../../domain/ports/gestionRepository.port';
import { Gestion } from '../../domain/gestion';
import { db } from '../../config/firebase';
import { ApiError } from '../../utils/ApiError';

@injectable()
export class FirebaseGestionAdapter implements GestionRepository {
  private readonly collection = db.collection('gestiones');

  private toDate(value: any): Date | undefined {
    if (!value) return value;
    if (value instanceof Timestamp) {
      return value.toDate();
    }
    if (value instanceof Date) {
      return value;
    }
    return new Date(value);
  }

  private toDomain(doc: FirebaseFirestore.DocumentSnapshot): Gestion {
    const data = doc.data();
    if (!data) {
      throw new ApiError('INTERNAL_SERVER_ERROR', `No se pudo leer la gestion ${doc.id}.`, 500);
    }

    return {
      id: doc.id,
      companiaCorretajeId: data.companiaCorretajeId,
      agenteId: data.agenteId,
      oficinaId: data.oficinaId,
      polizaId: data.polizaId,
      leadId: data.leadId,
      enteId: data.enteId,
      tipo: data.tipo,
      estado: data.estado,
      prioridad: data.prioridad,
      notas: data.notas,
      fechaCreacion: this.toDate(data.fechaCreacion) ?? new Date(),
      fechaActualizacion: this.toDate(data.fechaActualizacion) ?? new Date(),
      fechaVencimiento: this.toDate(data.fechaVencimiento),
      activo: data.activo,
    } as Gestion;
  }

  async create(data: GestionCreateInput): Promise<Gestion> {
    const docRef = this.collection.doc();
    const now = new Date();
    const payload = {
      ...data,
      id: docRef.id,
      fechaCreacion: now,
      fechaActualizacion: now,
    };
    await docRef.set(payload);
    const created = await docRef.get();
    return this.toDomain(created);
  }

  async findAllByCompania(companiaId: string): Promise<Gestion[]> {
    const snapshot = await this.collection.where('companiaCorretajeId', '==', companiaId).get();
    return snapshot.docs.map((doc) => this.toDomain(doc));
  }

  async findById(id: string): Promise<Gestion | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return this.toDomain(doc);
  }

  async update(id: string, data: GestionUpdateInput): Promise<Gestion> {
    const docRef = this.collection.doc(id);
    const exists = await docRef.get();
    if (!exists.exists) {
      throw new ApiError('GESTION_NOT_FOUND', 'Gestion no encontrada.', 404);
    }

    const updateData: any = {
      ...data,
      fechaActualizacion: data.fechaActualizacion ?? new Date(),
    };

    if (Object.prototype.hasOwnProperty.call(data, 'fechaVencimiento') && data.fechaVencimiento === null) {
      updateData.fechaVencimiento = FieldValue.delete();
    }

    await docRef.update(updateData);
    const updated = await docRef.get();
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    const docRef = this.collection.doc(id);
    await docRef.delete();
  }
}
