export interface Comentario {
  usuario: string;
  mensaje: string;
  fecha: Date;
}

export interface HistorialEstado {
  estado: "abierto" | "en progreso" | "resuelto" | "cerrado" | "rechazado";
  cambiado_por: string;
  fecha: Date;
}


/**
 * Representa un issue (incidencia, mejora o tarea) dentro de la colección "issues".
 */
export interface Issue {
  /** 🔑 Identificador opcional del documento (solo presente al leer desde Firestore) */
  id?: string;

  /** 🏷️ Información básica */
  titulo: string;
  descripcion: string;
  tipo: "bug" | "mejora" | "incidente" | "tarea" | "soporte";
  prioridad: "baja" | "media" | "alta" | "crítica";
  estado: "abierto" | "en progreso" | "resuelto" | "cerrado" | "rechazado";

  /** 👥 Relaciones */
  reportado_por: string; // email o id del usuario que reporta
  asignado_a?: string;   // email o id del responsable
  equipo?: string;       // frontend | backend | mobile | devops
  proyecto_id?: string;  // id del proyecto o módulo
  companiaCorretajeId: string; // referencia a compañía
  userId: string;              // referencia al usuario creador o dueño

  /** 🧩 Campos de contenido */
  etiquetas?: string[];
  comentarios?: Comentario[];
  historial_estados?: HistorialEstado[];
  imagenes?: string[];
  logs?: string;
  enlaces_relacionados?: string[];

  /** 🕒 Fechas de control */
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  fecha_resolucion?: Date;

  /** ⚙️ Configuración técnica / contexto */
  version_app?: string;
  entorno?: "producción" | "staging" | "desarrollo";
  impacto?: string;
  reproducible?: boolean;
}