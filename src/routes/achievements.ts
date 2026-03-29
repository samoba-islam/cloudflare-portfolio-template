// ============================================================
// Achievements routes — CRUD /api/achievements
// ============================================================

import type { Env, Achievement } from '../types';
import { jsonResponse, jsonError, notFound, jsonMessage } from '../utils/response';
import { authenticate, isAuthError } from '../middleware/auth';
import { getCached, setCache, invalidateCache, CACHE_KEYS } from '../middleware/cache';
import { parseBody, validateRequired } from '../utils/validation';

export async function listAchievements(request: Request, env: Env): Promise<Response> {
  const cached = await getCached<Achievement[]>(env, CACHE_KEYS.ACHIEVEMENTS);
  if (cached) return jsonResponse(cached);

  const { results } = await env.DB.prepare(
    'SELECT * FROM achievements ORDER BY sort_order ASC, date DESC'
  ).all<Achievement>();

  await setCache(env, CACHE_KEYS.ACHIEVEMENTS, results, 600);
  return jsonResponse(results);
}

export async function createAchievement(request: Request, env: Env): Promise<Response> {
  const auth = await authenticate(request, env);
  if (isAuthError(auth)) return auth;

  const body = await parseBody<Partial<Achievement>>(request);
  if (!body) return jsonError('Invalid JSON body');

  const err = validateRequired(body, ['title']);
  if (err) return jsonError(err);

  const result = await env.DB.prepare(
    `INSERT INTO achievements (title, description, issuer, date, certificate_url, sort_order)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(
    body.title, body.description || null, body.issuer || null,
    body.date || null, body.certificate_url || null, body.sort_order || 0
  ).run();

  await invalidateCache(env, CACHE_KEYS.ACHIEVEMENTS);

  const created = await env.DB.prepare('SELECT * FROM achievements WHERE id = ?')
    .bind(result.meta.last_row_id).first<Achievement>();
  return jsonResponse(created, 201);
}

export async function updateAchievement(request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  const auth = await authenticate(request, env);
  if (isAuthError(auth)) return auth;

  const id = parseInt(params.id);
  if (isNaN(id)) return jsonError('Invalid ID');

  const existing = await env.DB.prepare('SELECT id FROM achievements WHERE id = ?').bind(id).first();
  if (!existing) return notFound('Achievement not found');

  const body = await parseBody<Partial<Achievement>>(request);
  if (!body) return jsonError('Invalid JSON body');

  const fields = ['title', 'description', 'issuer', 'date', 'certificate_url', 'sort_order'];
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
    `UPDATE achievements SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  await invalidateCache(env, CACHE_KEYS.ACHIEVEMENTS);

  const updated = await env.DB.prepare('SELECT * FROM achievements WHERE id = ?').bind(id).first<Achievement>();
  return jsonResponse(updated);
}

export async function deleteAchievement(request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  const auth = await authenticate(request, env);
  if (isAuthError(auth)) return auth;

  const id = parseInt(params.id);
  if (isNaN(id)) return jsonError('Invalid ID');

  const existing = await env.DB.prepare('SELECT id FROM achievements WHERE id = ?').bind(id).first();
  if (!existing) return notFound('Achievement not found');

  await env.DB.prepare('DELETE FROM achievements WHERE id = ?').bind(id).run();
  await invalidateCache(env, CACHE_KEYS.ACHIEVEMENTS);

  return jsonMessage('Achievement deleted successfully');
}
