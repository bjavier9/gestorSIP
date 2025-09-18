export interface Ente {
  id: string;
  nombre: string;
  tipo: string;
  direccion: string;
  telefono: string;
  correo: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  activo: boolean;
  metadatos?: {
    creadoPor?: string;
    version?: number;
  };
}
