import { Gestion, GestionEstado, GestionPrioridad, GestionTipo } from '../entities/gestion';

export interface GestionCreateInput {
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
  fechaVencimiento?: Date;
  activo: boolean;
}

export interface GestionUpdateInput {
  agenteId?: string;
  oficinaId?: string;
  polizaId?: string;
  tipo?: GestionTipo;
  estado?: GestionEstado;
  prioridad?: GestionPrioridad;
  notas?: string;
  fechaActualizacion?: Date;
  fechaVencimiento?: Date | null;
  activo?: boolean;
  leadId?: string | null;
  enteId?: string | null;
}

export interface GestionRepository {
  create(data: GestionCreateInput): Promise<Gestion>;
  findAllByCompania(companiaId: string): Promise<Gestion[]>;
  findById(id: string): Promise<Gestion | null>;
  update(id: string, data: GestionUpdateInput): Promise<Gestion>;
  delete(id: string): Promise<void>;
}
