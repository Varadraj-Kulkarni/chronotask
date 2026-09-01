import { NextResponse } from 'next/server';

export interface StandardErrorPayload {
  code: string;
  message: string;
  details?: Record<string, unknown> | null;
  timestamp: string;
  path: string;
}

export function errorResponse(
  status: number,
  code: string,
  message: string,
  path: string,
  details: Record<string, unknown> | null = null
) {
  const payload: StandardErrorPayload = {
    code,
    message,
    details: details ?? null,
    timestamp: new Date().toISOString(),
    path,
  };
  return NextResponse.json(payload, { status });
}

export function invalidQueryParamsResponse(message: string, path: string, details?: Record<string, unknown>) {
  return errorResponse(400, 'INVALID_QUERY_PARAMS', message, path, details);
}

export function notFoundResponse(message: string, path: string, details?: Record<string, unknown>) {
  return errorResponse(404, 'NOT_FOUND', message, path, details);
}

export function conflictResponse(message: string, path: string, details?: Record<string, unknown>) {
  return errorResponse(409, 'TASK_ALREADY_COMPLETED', message, path, details);
}

export function validationFailedResponse(message: string, path: string, details?: Record<string, unknown>) {
  return errorResponse(422, 'VALIDATION_FAILED', message, path, details);
}

export function internalServerErrorResponse(path: string) {
  return errorResponse(
    500,
    'INTERNAL_SERVER_ERROR',
    'An internal server error occurred.',
    path,
    null
  );
}
