export interface Poliza {
    id: string;
    numeroPoliza: string;
    tipoPolizaId: string;
    aseguradoraId: string;
    tomadorId: number;
    aseguradoId: number;
    companiaCorretajeId: string;
    oficinaId: string;
    agenteId?: string;
    fechaInicio: Date;
    fechaVencimiento: Date;
    montoAsegurado: number;
    prima: number;
    moneda: string;
    estado: string;
    fechaCreacion: Date;
    fechaActualizacion: Date;
}

