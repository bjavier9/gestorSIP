import { injectable } from 'inversify';
import { getFirestore, CollectionReference, DocumentData } from 'firebase-admin/firestore';
import { PolizaRepository } from '../../domain/ports/polizaRepository.port';
import { Poliza } from '../../domain/poliza';
import { firebaseApp } from '../../config/firebase.config'; // Asegúrate que la app de Firebase se inicialice centralmente

@injectable()
export class FirebasePolizaAdapter implements PolizaRepository {
    private readonly db = getFirestore(firebaseApp);
    private readonly polizasCollection = this.db.collection('polizas') as CollectionReference<Poliza>;

    private mapDocToPoliza(doc: DocumentData): Poliza {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            // Las fechas de Firestore necesitan ser convertidas a objetos Date de JS
            fechaInicio: data.fechaInicio.toDate(),
            fechaVencimiento: data.fechaVencimiento.toDate(),
            fechaCreacion: data.fechaCreacion.toDate(),
            fechaActualizacion: data.fechaActualizacion.toDate(),
        } as Poliza;
    }

    async findAll(): Promise<Poliza[]> {
        const snapshot = await this.polizasCollection.get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => this.mapDocToPoliza(doc));
    }

    async findById(id: string): Promise<Poliza | null> {
        const docRef = this.polizasCollection.doc(id);
        const snapshot = await docRef.get();

        if (!snapshot.exists) {
            return null;
        }

        return this.mapDocToPoliza(snapshot);
    }
}
