export interface Lead {
    id: string;
    nombre: string;
    correo: string;
    telefono: string;
    companiaCorretajeId: string;
    agenteId?: string;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    estado: 'nuevo' | 'contactado' | 'calificado' | 'perdido' | 'ganado';
    origen: string;
}
