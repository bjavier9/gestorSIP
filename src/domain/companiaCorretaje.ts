export interface Modificado {
  idente: number;
  fechaActualizacion: Date;
}

export interface Creada {
  idente: number;
}

export interface CompaniaCorretaje {
  id: string;
  nombre: string;
  rif: string;
  direccion: string;
  telefono: string;
  correo: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  activo: boolean;
  creada: Creada;
  modificado: Modificado[];
  monedasAceptadas: string[];
  monedaPorDefecto: string;
  modulos: string[];
}
