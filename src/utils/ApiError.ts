// src/utils/ApiError.ts

import errorMessages from './errorMessages.json';
import Logger from '../config/logger';

// Le damos una firma de índice al JSON importado
const errorMessagesTyped: Record<string, { status: number; description: string }> = errorMessages;

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorKey: string;
  public readonly originalError: any;

  constructor(key: string, statusCodeOrMessage?: number | string, messageOrError?: string | any, originalError?: any) {
    const errorConfig = errorMessagesTyped[key] || {};

    let customStatusCode: number | undefined;
    let customMessage: string | undefined;
    let errorInstance: any;

    if (typeof statusCodeOrMessage === 'number') {
      customStatusCode = statusCodeOrMessage;
      if (typeof messageOrError === 'string') {
        customMessage = messageOrError;
        errorInstance = originalError;
      } else {
        errorInstance = messageOrError;
      }
    } else if (typeof statusCodeOrMessage === 'string') {
      customMessage = statusCodeOrMessage;
      errorInstance = messageOrError;
    } else {
      errorInstance = statusCodeOrMessage;
    }

    const message = customMessage || errorConfig.description || 'Ocurrió un error inesperado.';
    const statusCode = customStatusCode || errorConfig.status || 500;

    super(message);

    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorKey = key;
    this.originalError = errorInstance;

    Logger.error({
      key: this.errorKey,
      message: this.message,
      statusCode: this.statusCode,
      originalError: this.originalError,
    });
  }
}
