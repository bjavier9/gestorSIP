export interface User {
    id: string,
    email: string;
    password: string; 
    enteId: string;
    roles: string[];
    createdAt: Date
}
