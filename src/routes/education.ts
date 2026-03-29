// ============================================================
// Education routes — CRUD /api/education
// ============================================================

import type { Env, Education } from '../types';
import { jsonResponse, jsonError, notFound, jsonMessage } from '../utils/response';
import { authenticate, isAuthError } from '../middleware/auth';
import { getCached, setCache, invalidateCache, CACHE_KEYS } from '../middleware/cache';
import { parseBody, validateRequired } from '../utils/validation';

export async function listEducation(request: Request, env: Env): Promise<Response> {
  const cached = await getCached<Education[]>(env, CACHE_KEYS.EDUCATION);
  if (cached) return jsonResponse(cached);

  const { results } = await env.DB.prepare(
    'SELECT * FROM education ORDER BY sort_order ASC, start_date DESC'
  ).all<Education>();

  await setCache(env, CACHE_KEYS.EDUCATION, results, 600);
  return jsonResponse(results);
}

export async function createEducation(request: Request, env: Env): Promise<Response> {
  const auth = await authenticate(request, env);
  if (isAuthError(auth)) return auth;

  const body = await parseBody<Partial<Education>>(request);
  if (!body) return jsonError('Invalid JSON body');

  const err = validateRequired(body, ['institution', 'degree', 'start_date']);
  if (err) return jsonError(err);

  const result = await env.DB.prepare(
    `INSERT INTO education (institution, degree, field, start_date, end_date, is_current, result, description, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    body.institution, body.degree, body.field || null,
    body.start_date, body.end_date || null, body.is_current || 0,
    body.result || null, body.description || null, body.sort_order || 0
  ).run();

  await invalidateCache(env, CACHE_KEYS.EDUCATION);

  const created = await env.DB.prepare('SELECT * FROM education WHERE id = ?')
    .bind(result.meta.last_row_id).first<Education>();
  return jsonResponse(created, 201);
}

export async function updateEducation(request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  const auth = await authenticate(request, env);
  if (isAuthError(auth)) return auth;

  const id = parseInt(params.id);
  if (isNaN(id)) return jsonError('Invalid ID');

  const existing = await env.DB.prepare('SELECT id FROM education WHERE id = ?').bind(id).first();
  if (!existing) return notFound('Education not found');

  const body = await parseBody<Partial<Education>>(request);
  if (!body) return jsonError('Invalid JSON body');

  const fields = ['institution', 'degree', 'field', 'start_date', 'end_date', 'is_current', 'result', 'description', 'sort_order'];
  const updates: string[] = [];
  const values: any[] = [];

  for (const field of fields) {
    if ((body as any)[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push((body as any)[field]);
    }
  }

  if (updates.length === 0) return jsonError('No fields to update');

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  await env.DB.prepare(
    `UPDATE education SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  await invalidateCache(env, CACHE_KEYS.EDUCATION);

  const updated = await env.DB.prepare('SELECT * FROM education WHERE id = ?').bind(id).first<Education>();
  return jsonResponse(updated);
}

export async function deleteEducation(request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  const auth = await authenticate(request, env);
  if (isAuthError(auth)) return auth;

  const id = parseInt(params.id);
  if (isNaN(id)) return jsonError('Invalid ID');

  const existing = await env.DB.prepare('SELECT id FROM education WHERE id = ?').bind(id).first();
  if (!existing) return notFound('Education not found');

  await env.DB.prepare('DELETE FROM education WHERE id = ?').bind(id).run();
  await invalidateCache(env, CACHE_KEYS.EDUCATION);

  return jsonMessage('Education deleted successfully');
}
