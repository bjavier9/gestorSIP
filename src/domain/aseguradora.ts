
export interface Aseguradora {
  id: string;
  nombre: string;
  codigo: string;
  direccion: string;
  telefono: string;
  correo: string;
  rating: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}
