// ============================================================
// Experience routes — CRUD /api/experience
// ============================================================

import type { Env, Experience } from '../types';
import { jsonResponse, jsonError, notFound, jsonMessage } from '../utils/response';
import { authenticate, isAuthError } from '../middleware/auth';
import { getCached, setCache, invalidateCache, CACHE_KEYS } from '../middleware/cache';
import { parseBody, validateRequired } from '../utils/validation';

export async function listExperience(request: Request, env: Env): Promise<Response> {
  const cached = await getCached<Experience[]>(env, CACHE_KEYS.EXPERIENCE);
  if (cached) return jsonResponse(cached);

  const { results } = await env.DB.prepare(
    'SELECT * FROM experience ORDER BY sort_order ASC, start_date DESC'
  ).all<Experience>();

  await setCache(env, CACHE_KEYS.EXPERIENCE, results, 600);
  return jsonResponse(results);
}

export async function createExperience(request: Request, env: Env): Promise<Response> {
  const auth = await authenticate(request, env);
  if (isAuthError(auth)) return auth;

  const body = await parseBody<Partial<Experience>>(request);
  if (!body) return jsonError('Invalid JSON body');

  const err = validateRequired(body, ['company', 'role', 'start_date']);
  if (err) return jsonError(err);

  const result = await env.DB.prepare(
    `INSERT INTO experience (company, role, start_date, end_date, is_current, description, tech_stack, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    body.company, body.role, body.start_date,
    body.end_date || null, body.is_current || 0,
    body.description || null,
    typeof body.tech_stack === 'string' ? body.tech_stack : JSON.stringify(body.tech_stack || []),
    body.sort_order || 0
  ).run();

  await invalidateCache(env, CACHE_KEYS.EXPERIENCE);

  const created = await env.DB.prepare('SELECT * FROM experience WHERE id = ?')
    .bind(result.meta.last_row_id).first<Experience>();
  return jsonResponse(created, 201);
}

export async function updateExperience(request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  const auth = await authenticate(request, env);
  if (isAuthError(auth)) return auth;

  const id = parseInt(params.id);
  if (isNaN(id)) return jsonError('Invalid ID');

  const existing = await env.DB.prepare('SELECT id FROM experience WHERE id = ?').bind(id).first();
  if (!existing) return notFound('Experience not found');

  const body = await parseBody<Partial<Experience>>(request);
  if (!body) return jsonError('Invalid JSON body');

  const fields = ['company', 'role', 'start_date', 'end_date', 'is_current', 'description', 'tech_stack', 'sort_order'];
  const updates: string[] = [];
  const values: any[] = [];

  for (const field of fields) {
    if ((body as any)[field] !== undefined) {
      let value = (body as any)[field];
      if (field === 'tech_stack' && typeof value !== 'string') {
        value = JSON.stringify(value);
      }
      updates.push(`${field} = ?`);
      values.push(value);
    }
  }

  if (updates.length === 0) return jsonError('No fields to update');

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  await env.DB.prepare(
    `UPDATE experience SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  await invalidateCache(env, CACHE_KEYS.EXPERIENCE);

  const updated = await env.DB.prepare('SELECT * FROM experience WHERE id = ?').bind(id).first<Experience>();
  return jsonResponse(updated);
}

export async function deleteExperience(request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  const auth = await authenticate(request, env);
  if (isAuthError(auth)) return auth;

  const id = parseInt(params.id);
  if (isNaN(id)) return jsonError('Invalid ID');

  const existing = await env.DB.prepare('SELECT id FROM experience WHERE id = ?').bind(id).first();
  if (!existing) return notFound('Experience not found');

  await env.DB.prepare('DELETE FROM experience WHERE id = ?').bind(id).run();
  await invalidateCache(env, CACHE_KEYS.EXPERIENCE);

  return jsonMessage('Experience deleted successfully');
}
