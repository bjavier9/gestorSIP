import { Issue } from '../entities/issue';

/**
 * Repositorio que define las operaciones CRUD sobre la colección "issues"
 * siguiendo los principios de la arquitectura hexagonal (puerto/repositorio).
 */
export interface IssueRepository {
//   /**
//    * Crea un nuevo issue en el sistema.
//    * Excluye los campos generados automáticamente como `id`, `fecha_creacion` y `fecha_actualizacion`.
//    */
//   create(issue: Omit<Issue, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>): Promise<Issue>;

//   /**
//    * Obtiene todos los issues asociados a una compañía de corretaje específica.
//    * @param companiaCorretajeId ID de la compañía
//    */
//   findAllByCompania(companiaCorretajeId: string): Promise<Issue[]>;

  /**
   * Busca un issue por su ID único.
   * @param id ID del issue en Firestore
   */
  findById(id: string): Promise<Issue | null>;

//   /**
//    * Actualiza los campos de un issue existente.
//    * @param id ID del issue
//    * @param updates Campos parciales del issue a modificar
//    */
//   update(id: string, updates: Partial<Issue>): Promise<Issue>;

//   /**
//    * Elimina un issue del sistema.
//    * @param id ID del issue
//    */
//   delete(id: string): Promise<void>;
}
