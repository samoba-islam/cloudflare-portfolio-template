// ============================================================
// Standard JSON response helpers
// ============================================================

import type { ApiResponse } from '../types';

export function jsonResponse<T>(data: T, status = 200): Response {
  const body: ApiResponse<T> = { success: true, data };
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function jsonMessage(message: string, status = 200): Response {
  const body: ApiResponse = { success: true, message };
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function jsonError(error: string, status = 400): Response {
  const body: ApiResponse = { success: false, error };
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function notFound(message = 'Resource not found'): Response {
  return jsonError(message, 404);
}

export function unauthorized(message = 'Unauthorized'): Response {
  return jsonError(message, 401);
}

export function forbidden(message = 'Forbidden'): Response {
  return jsonError(message, 403);
}

export function serverError(message = 'Internal server error'): Response {
  return jsonError(message, 500);
}
