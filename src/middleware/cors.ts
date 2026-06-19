// ============================================================
// CORS middleware
// ============================================================

import type { Env } from '../types';

function resolveAllowedOrigin(request: Request, env: Env): string {
  const requestOrigin = request.headers.get('Origin') || '';
  const configuredOrigins = (env.CORS_ORIGINS || env.CORS_ORIGIN || '*')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins.length === 0) return '*';
  if (configuredOrigins.includes('*')) return '*';
  if (requestOrigin && configuredOrigins.includes(requestOrigin)) return requestOrigin;

  // Return first configured origin when request origin does not match.
  // Browser will block disallowed origins, but this keeps server behavior explicit.
  return configuredOrigins[0];
}

export function corsHeaders(request: Request, env: Env): Record<string, string> {
  const allowedOrigin = resolveAllowedOrigin(request, env);
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

export function handleOptions(request: Request, env: Env): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request, env),
  });
}

export function addCorsHeaders(response: Response, request: Request, env: Env): Response {
  const headers = new Headers(response.headers);
  const cors = corsHeaders(request, env);
  for (const [key, value] of Object.entries(cors)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
