import { injectable } from 'inversify';
import { getFirestore, CollectionReference, DocumentData, Query } from 'firebase-admin/firestore';
import { PolizaRepository, PolizaSearchCriteria } from '../../domain/ports/polizaRepository.port';
import { Poliza } from '../../domain/poliza';
import { firebaseApp } from '../../config/firebase';

@injectable()
export class FirebasePolizaAdapter implements PolizaRepository {
    private readonly db = getFirestore(firebaseApp);
    private readonly polizasCollection = this.db.collection('polizas') as CollectionReference<Poliza>;

    private mapDocToPoliza(doc: DocumentData): Poliza {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            fechaInicio: data.fechaInicio.toDate(),
            fechaVencimiento: data.fechaVencimiento.toDate(),
            fechaCreacion: data.fechaCreacion.toDate(),
            fechaActualizacion: data.fechaActualizacion.toDate(),
        } as Poliza;
    }

    async findByCriteria(criteria: PolizaSearchCriteria): Promise<Poliza[]> {
        let query: Query = this.polizasCollection;

        // Filtro obligatorio por compañía
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

        // Verificar que la póliza pertenece a la compañía correcta
        if (poliza.companiaCorretajeId !== companiaCorretajeId) {
            return null;
        }

        return poliza;
    }
}
