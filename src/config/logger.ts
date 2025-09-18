import winston from 'winston';

// Determina el nivel de log basado en el entorno
const level = process.env.LOG_LEVEL || 'info';

// Define los niveles de severidad estándar de npm
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Colores para cada nivel de log (para la consola)
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};
winston.addColors(colors);

// Formato para desarrollo: colorido y simple
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Formato para producción: JSON estructurado
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }), // Incluye el stack trace en los errores
  winston.format.json(),
);

// Elige el formato basado en el entorno
const format = process.env.NODE_ENV === 'production' ? prodFormat : devFormat;

// Define los "transportes" (a dónde se envían los logs)
const transports = [
  // Siempre mostrar los logs en la consola
  new winston.transports.Console(),
  
  // En producción, también guardar los errores en un archivo separado
  // Esto es útil para una rápida auditoría de errores graves.
  ...(process.env.NODE_ENV === 'production' ? [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({ filename: 'logs/all.log' }),
  ] : []),
];

// Crea y exporta la instancia del logger
const Logger = winston.createLogger({
  level,
  levels,
  format,
  transports,
  exitOnError: false, // No salir de la aplicación en errores no manejados
});

export default Logger;
