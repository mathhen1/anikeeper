import type { ErrorRequestHandler } from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { ApiError } from '../lib/api-error.js';

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
) => {
  if (error instanceof ApiError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      error: 'Request validation failed.',
      details: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    response.status(400).json({
      error: 'Database validation failed.',
      details: Object.values(error.errors).map((issue) => ({
        field: issue.path,
        message: issue.message,
      })),
    });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    response.status(400).json({
      error: `Invalid value for ${error.path}.`,
    });
    return;
  }

  if (error instanceof multer.MulterError) {
    const statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    response.status(statusCode).json({ error: error.message });
    return;
  }

  if (isRequestBodyError(error)) {
    response.status(error.status).json({
      error:
        error.status === 413
          ? 'Request body is too large.'
          : 'Request body contains invalid JSON.',
    });
    return;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  ) {
    response.status(409).json({ error: 'A resource with this value already exists.' });
    return;
  }

  console.error('Unhandled API error:', error);
  response.status(500).json({ error: 'An unexpected error occurred.' });
};

function isRequestBodyError(
  error: unknown,
): error is { status: number; type: string } {
  if (typeof error !== 'object' || error === null || !('status' in error)) {
    return false;
  }

  const status = error.status;
  if (status !== 400 && status !== 413) return false;

  return (
    'type' in error &&
    typeof error.type === 'string' &&
    (error.type === 'entity.parse.failed' || error.type === 'entity.too.large')
  );
}
