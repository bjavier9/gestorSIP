
export interface ConfigurationItem {
    // Esta interfaz es flexible y puede contener cualquier clave
    [key: string]: any;
    activo: boolean;
}

export interface Configuration {
    id: string; // El ID será el nombre del documento (ej. "roles", "currencies")
    name: string;
    description: string;
    items: ConfigurationItem[];
}
