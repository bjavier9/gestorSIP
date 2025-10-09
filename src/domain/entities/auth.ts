import { UsuarioCompania } from "./usuarioCompania";

export interface LoginResponse {
    token: string;
    companias: UsuarioCompania[];
    needsSelection: boolean;
    isSuperAdmin?: boolean; // campo opcional
  }

  export interface AuthPayload {
    uid: string;
    email: string;
    role: string;
    companiaCorretajeId?: string;
    oficinaId?: string;
    enteId?: string;
    
  }

  export interface RegisterUserInput {
    enteId: string;
    rol: string;
    companiaCorretajeId?: string;
    oficinaId?: string;
  }
  
  export interface RegisterUserResult {
    uid: string;
    email: string;
    defaultPassword?: string;
    usuarioCompaniaId: string;
  }
  