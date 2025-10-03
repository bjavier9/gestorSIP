export type GestionEstado = 'borrador' | 'en_gestion' | 'en_tramite' | 'gestionado_exito' | 'desistido';
export type GestionTipo = 'nueva' | 'renovacion';
export type GestionPrioridad = 'baja' | 'media' | 'alta';

export interface Gestion {
  id: string;
  companiaCorretajeId: string;
  agenteId: string;
  oficinaId?: string;
  polizaId?: string;
  leadId?: string;
  enteId?: string;
  tipo: GestionTipo;
  estado: GestionEstado;
  prioridad?: GestionPrioridad;
  notas?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  fechaVencimiento?: Date | null;
  activo: boolean;
}
