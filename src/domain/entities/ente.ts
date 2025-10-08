// src/domain/ente.ts

// Base interface with common fields for all 'Ente' types
export interface EnteBase {
  id: string; // Firestore document ID
  companiaCorretajeId: string;
  nombre: string;
  tipo: 'Persona Natural' | 'Persona Juridica' | 'Persona Jur\u00eddica';
  documento: string;
  tipo_documento: string;
  direccion: string;
  telefono: string;
  correo: string;
  idregion: number;
  idReferido: string | null;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  activo: boolean;
}

// Interface for metadata of a Natural Person
export interface MetadatosPersonaNatural {
  creadoPor: string; // User ID or system identifier
  fechaNacimiento: Date;
  genero: 'M' | 'F';
  estadoCivil: string;
  profesion: string;
  nacionalidad: string;
  hijos?: number;
  vehiculos?: number;
  ultimaActualizacion: Date;
}

// Interface for metadata of a Legal Entity
export interface MetadatosPersonaJuridica {
  creadoPor: string; // User ID or system identifier
  fechaConstitucion: Date;
  sector: string;
  empleados: number;
  facturacionAnual: string;
  ultimaActualizacion: Date;
}

// Interface for a Natural Person, extending the base and using specific metadata
export interface EntePersonaNatural extends EnteBase {
  tipo: 'Persona Natural';
  metadatos: MetadatosPersonaNatural;
}

// Interface for a Legal Entity, extending the base and using specific metadata
export interface EntePersonaJuridica extends EnteBase {
  tipo: 'Persona Juridica' | 'Persona Jur\u00eddica';
  metadatos: MetadatosPersonaJuridica;
}

// Discriminated Union: An 'Ente' can be one of the specific types
export type Ente = EntePersonaNatural | EntePersonaJuridica;
