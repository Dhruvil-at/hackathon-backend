import { Request, Response, NextFunction } from 'express';

export class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string = 'Bad request') {
    super(message, 400);
  }
}

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  // Format error log
  const timestamp = new Date().toISOString();
  const errorLog = [
    `[${req.ip || 'unknown'}]`,
    `[${timestamp}]`,
    `["${req.method}`,
    `${req.protocol}://${req.hostname}${req.url}`,
    `HTTP/${req.httpVersion || '1.1'}"]`,
    `[${(err as HttpError).statusCode || 500}]`,
    `[ERROR]`,
    '-',
    `[${Date.now() - (res.locals.startEpoch || Date.now())}]`,
    'ms',
    `[${req.headers['user-agent'] || 'unknown'}]`,
    `ERROR: ${err.message}`,
  ].join(' ');

  console.error(errorLog);

  // Add stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
    return;
  }

  // Handle Joi validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: err.message,
    });
  }

  // Handle known HTTP errors
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Handle general authentication errors
  if (err.message === 'Invalid credentials') {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  // Default server error response
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
  return;
};
