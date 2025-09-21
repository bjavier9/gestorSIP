
// src/domain/usuarioCompania.ts

export interface UsuarioCompania {
  id: string; // The user's UID
  enteId: number;
  companiaCorretajeId: string; // Reverted to the correct field name
  oficinaId: string;
  rol: 'admin' | 'supervisor' | 'agent' | 'viewer';
  activo: boolean;
}
