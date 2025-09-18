import { Response } from 'express';
import ApiError from './ApiError';

interface SuccessResponse {
  success: true;
  status: number;
  data: any;
}

interface ErrorResponse {
  success: false;
  status: number;
  error: {
    key: string;
    message: string;
  };
}

export const handleSuccess = (res: Response, data: any, status: number = 200): Response => {
  const response: SuccessResponse = {
    success: true,
    status,
    data,
  };
  return res.status(status).json(response);
};

export const handleError = (res: Response, error: any): Response => {
  if (error instanceof ApiError) {
    const response: ErrorResponse = {
      success: false,
      status: error.statusCode,
      error: {
        key: error.errorKey,
        message: error.message,
      },
    };
    return res.status(error.statusCode).json(response);
  } 
  
  // Handle unexpected errors
  console.error('UNHANDLED_ERROR:', error); // Log the unexpected error for debugging
  const response: ErrorResponse = {
    success: false,
    status: 500,
    error: {
      key: 'SERVER_INTERNAL_ERROR',
      message: 'Ocurrió un error inesperado en el servidor.',
    },
  };
  return res.status(500).json(response);
};
