import { Request, Response } from 'express';
import { ApiError } from './ApiError';

interface ApiResponseHeader {
  timestamp: string;
  token?: string;
}

interface ApiResponseStatus {
  code: number;
  success: boolean;
}

interface SuccessResponseBody {
  data: unknown;
  [key: string]: unknown;
}

interface ErrorResponseBody {
  error: {
    key: string;
    message: string;
  };
  [key: string]: unknown;
}

interface SuccessResponse {
  header: ApiResponseHeader;
  body: SuccessResponseBody;
  status: ApiResponseStatus;
}

interface ErrorResponse {
  header: ApiResponseHeader;
  body: ErrorResponseBody;
  status: ApiResponseStatus;
}

interface SuccessOptions {
  token?: string;
  bodyOverrides?: Record<string, unknown>;
  message?: string;
}

const extractTokenFromRequest = (req: Request): string | undefined => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return undefined;
  }

  const [scheme, token] = authHeader.split(' ');

  if (token && scheme && scheme.toLowerCase() === 'bearer') {
    return token;
  }

  return authHeader || undefined;
};

const buildHeader = (req: Request, overrideToken?: string): ApiResponseHeader => {
  const token = overrideToken ?? extractTokenFromRequest(req);
  return token
    ? { timestamp: new Date().toISOString(), token }
    : { timestamp: new Date().toISOString() };
};

const buildStatus = (code: number, success: boolean): ApiResponseStatus => ({
  code,
  success,
});

export const handleSuccess = (
  req: Request,
  res: Response,
  data: unknown,
  statusCode: number = 200,
  options: SuccessOptions = {},
): Response => {
  const header = buildHeader(req, options.token);

  const body: SuccessResponseBody = {
    data,
  };

  if (options.message) {
    body.message = options.message;
  }

  if (options.bodyOverrides) {
    Object.assign(body, options.bodyOverrides);
  }

  const response: SuccessResponse = {
    header,
    body,
    status: buildStatus(statusCode, true),
  };

  return res.status(statusCode).json(response);
};

export const handleError = (
  req: Request,
  res: Response,
  error: unknown,
): Response => {
  if (error instanceof ApiError) {
    const response: ErrorResponse = {
      header: buildHeader(req),
      body: {
        error: {
          key: error.errorKey,
          message: error.message,
        },
      },
      status: buildStatus(error.statusCode, false),
    };
    return res.status(error.statusCode).json(response);
  }

  console.error('UNHANDLED_ERROR:', error);

  const response: ErrorResponse = {
    header: buildHeader(req),
    body: {
      error: {
        key: 'SERVER_INTERNAL_ERROR',
        message: 'Ocurrio un error inesperado en el servidor.',
      },
    },
    status: buildStatus(500, false),
  };

  return res.status(500).json(response);
};
