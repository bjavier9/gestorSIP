
export interface Oficina {
  id: string;
  companiaCorretajeId: string;
  nombre: string;
  direccion: string;
  telefono: string;
  moneda: string;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}
