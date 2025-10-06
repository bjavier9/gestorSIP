
export interface UsuarioCompania {
  id: string;                
  userId: string;            
  email: string;             
  companiaCorretajeId: string; 
  rol: 'admin' | 'supervisor' | 'agent' | 'viewer';
  activo: boolean;
  fechaCreacion: Date;
  // Optional properties
  enteId?: string;
  oficinaId?: string;
}
