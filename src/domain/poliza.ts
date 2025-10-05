import { IsString, IsDate, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class Poliza {
    @IsString()
    id: string;

    @IsString()
    @IsNotEmpty()
    numeroPoliza: string;

    @IsString()
    @IsNotEmpty()
    tipoPolizaId: string;

    @IsString()
    @IsNotEmpty()
    aseguradoraId: string;

    @IsNumber()
    @IsNotEmpty()
    tomadorId: number;

    @IsNumber()
    @IsNotEmpty()
    aseguradoId: number;

    @IsString()
    @IsNotEmpty()
    companiaCorretajeId: string;

    @IsString()
    @IsNotEmpty()
    oficinaId: string;

    @IsString()
    @IsOptional()
    agenteId?: string;

    @IsDate()
    fechaInicio: Date;

    @IsDate()
    fechaVencimiento: Date;

    @IsNumber()
    montoAsegurado: number;

    @IsNumber()
    prima: number;

    @IsString()
    moneda: string;

    @IsString()
    estado: string; // e.g., 'ACTIVA', 'PENDIENTE_PAGO', 'VENCIDA', 'CANCELADA'

    @IsDate()
    fechaCreacion: Date;

    @IsDate()
    fechaActualizacion: Date;
}
