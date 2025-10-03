
import { Oficina } from '../oficina';

/**
 * Puerto que define las operaciones de persistencia para las oficinas.
 * La implementación de este puerto (el adaptador) se encargará de la lógica
 * específica de la base de datos, como la construcción de rutas a subcolecciones.
 */
export interface OficinaRepository {
  /**
   * Crea una nueva oficina. El `companiaCorretajeId` debe estar presente en el objeto.
   * @param oficina Datos de la oficina a crear.
   */
  create(oficina: Omit<Oficina, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<Oficina>;

  /**
   * Busca todas las oficinas de una compañía específica.
   * @param companiaId ID de la compañía propietaria de las oficinas.
   */
  findAll(companiaId: string): Promise<Oficina[]>;

  /**
   * Busca una oficina específica por su ID y el ID de su compañía.
   * @param companiaId ID de la compañía.
   * @param oficinaId ID de la oficina.
   */
  findById(companiaId: string, oficinaId: string): Promise<Oficina | null>;

  /**
   * Actualiza los datos de una oficina. El ID de la compañía y de la oficina deben estar incluidos.
   * @param id ID de la oficina a actualizar.
   * @param updates Datos parciales para actualizar.
   */
  update(id: string, updates: Partial<Oficina>): Promise<Oficina | null>;

  /**
   * Elimina una oficina.
   * @param companiaId ID de la compañía propietaria.
   * @param oficinaId ID de la oficina a eliminar.
   */
  delete(companiaId: string, oficinaId: string): Promise<boolean>;
}
