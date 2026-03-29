// ============================================================
// Authentication middleware — JWT verification
// ============================================================

import type { Env, JWTPayload } from '../types';
import { verifyJWT } from '../utils/jwt';
import { unauthorized } from '../utils/response';

export async function authenticate(
  request: Request,
  env: Env
): Promise<JWTPayload | Response> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized('Missing or invalid Authorization header');
  }

  const token = authHeader.slice(7);
  const payload = await verifyJWT(token, env.JWT_SECRET);

  if (!payload) {
    return unauthorized('Invalid or expired token');
  }

  return payload;
}

// Helper to check if auth result is an error response
export function isAuthError(result: JWTPayload | Response): result is Response {
  return result instanceof Response;
}
