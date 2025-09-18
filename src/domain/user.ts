export interface User {
    id: string;
    email: string;
    password: string; // This is the hashed password
    enteId: string;
    roles: string[];
    createdAt: Date;
}
