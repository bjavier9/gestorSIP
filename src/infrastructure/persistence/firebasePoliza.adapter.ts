import { injectable } from 'inversify';
import { getFirestore, CollectionReference, Query, QueryDocumentSnapshot, DocumentSnapshot } from 'firebase-admin/firestore';
import { PolizaRepository, PolizaSearchCriteria } from '../../domain/ports/polizaRepository.port';
import { Poliza } from '../../domain/entities/poliza';

@injectable()
export class FirebasePolizaAdapter implements PolizaRepository {
    private readonly db = getFirestore();
    private readonly polizasCollection = this.db.collection('polizas') as CollectionReference<Poliza>;

    private mapDocToPoliza(doc: QueryDocumentSnapshot<Poliza> | DocumentSnapshot<Poliza>): Poliza {
        const data = doc.data();
        if (!data) {
            throw new Error(`Documento de poliza ${doc.id} sin datos.`);
        }

        const normalizeDate = (value: unknown, field: string): Date => {
            if (!value) {
                throw new Error(`Campo ${field} ausente en poliza ${doc.id}`);
            }

            if (value instanceof Date) {
                return value;
            }

            if (value && typeof value === 'object' && 'toDate' in (value as Record<string, unknown>)) {
                return (value as { toDate: () => Date }).toDate();
            }

            const parsed = new Date(String(value));
            if (Number.isNaN(parsed.getTime())) {
                throw new Error(`Campo ${field} tiene fecha invalida en poliza ${doc.id}`);
            }

            return parsed;
        };

        return {
            ...data,
            id: doc.id,
            fechaInicio: normalizeDate(data.fechaInicio, 'fechaInicio'),
            fechaVencimiento: normalizeDate(data.fechaVencimiento, 'fechaVencimiento'),
            fechaCreacion: normalizeDate(data.fechaCreacion, 'fechaCreacion'),
            fechaActualizacion: normalizeDate(data.fechaActualizacion, 'fechaActualizacion'),
        } as Poliza;
    }

    async findByCriteria(criteria: PolizaSearchCriteria): Promise<Poliza[]> {
        let query: Query<Poliza> = this.polizasCollection;

        // Filtro obligatorio por compania
        query = query.where('companiaCorretajeId', '==', criteria.companiaCorretajeId);

        if (criteria.agenteId) {
            query = query.where('agenteId', '==', criteria.agenteId);
        }

        if (criteria.estado) {
            query = query.where('estado', '==', criteria.estado);
        }

        if (criteria.fechaVencimiento) {
            query = query.where('fechaVencimiento', '<=', criteria.fechaVencimiento);
        }

        const snapshot = await query.get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => this.mapDocToPoliza(doc));
    }

    async findById(id: string, companiaCorretajeId: string): Promise<Poliza | null> {
        const docRef = this.polizasCollection.doc(id);
        const snapshot = await docRef.get();

        if (!snapshot.exists) {
            return null;
        }

        const poliza = this.mapDocToPoliza(snapshot);

        // Verificar que la poliza pertenece a la compania correcta
        if (poliza.companiaCorretajeId !== companiaCorretajeId) {
            return null;
        }

        return poliza;
    }
}

