import { CollectionReference, Firestore } from 'firebase-admin/firestore';

/**
 * @description Repositorio para gestionar las relaciones entre Entes y Compañías de Corretaje.
 */
export class FirebaseEnteCompaniaRepository {
    private collection: CollectionReference;

    constructor(firestore: Firestore) {
        this.collection = firestore.collection('entes_companias');
    }

    /**
     * @description Crea un nuevo documento en la colección 'entes_companias' para vincular un ente a una compañía.
     * @param enteId El ID del ente (usuario/persona) que se une a la compañía.
     * @param companiaId El ID de la compañía de corretaje.
     * @param roles - Un array de roles que el ente tendrá en la compañía (ej: ['agente', 'supervisor'])
     * @returns {Promise<string>} El ID del nuevo documento de relación creado.
     */
    async create(enteId: string, companiaId: string, roles: string[] = ['agente']): Promise<string> {
        const docRef = await this.collection.add({
            enteId,
            companiaId,
            roles,
            fechaVinculacion: new Date(),
            activo: true
        });
        return docRef.id;
    }
}
