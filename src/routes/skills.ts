// ============================================================
// Skills routes — CRUD /api/skills
// ============================================================

import type { Env, Skill } from '../types';
import { jsonResponse, jsonError, notFound, jsonMessage } from '../utils/response';
import { authenticate, isAuthError } from '../middleware/auth';
import { getCached, setCache, invalidateCache, CACHE_KEYS } from '../middleware/cache';
import { parseBody, validateRequired } from '../utils/validation';

export async function listSkills(request: Request, env: Env): Promise<Response> {
  const cached = await getCached<Skill[]>(env, CACHE_KEYS.SKILLS);
  if (cached) return jsonResponse(cached);

  const { results } = await env.DB.prepare(
    'SELECT * FROM skills ORDER BY category, sort_order ASC'
  ).all<Skill>();

  await setCache(env, CACHE_KEYS.SKILLS, results, 600);
  return jsonResponse(results);
}

export async function createSkill(request: Request, env: Env): Promise<Response> {
  const auth = await authenticate(request, env);
  if (isAuthError(auth)) return auth;

  const body = await parseBody<Partial<Skill>>(request);
  if (!body) return jsonError('Invalid JSON body');

  const err = validateRequired(body, ['name', 'category']);
  if (err) return jsonError(err);

  const result = await env.DB.prepare(
    `INSERT INTO skills (name, category, level, icon_url, sort_order) VALUES (?, ?, ?, ?, ?)`
  ).bind(
    body.name, body.category, body.level || 'intermediate',
    body.icon_url || null, body.sort_order || 0
  ).run();

  await invalidateCache(env, CACHE_KEYS.SKILLS);

  const created = await env.DB.prepare('SELECT * FROM skills WHERE id = ?')
    .bind(result.meta.last_row_id).first<Skill>();
  return jsonResponse(created, 201);
}

export async function updateSkill(request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  const auth = await authenticate(request, env);
  if (isAuthError(auth)) return auth;

  const id = parseInt(params.id);
  if (isNaN(id)) return jsonError('Invalid ID');

  const existing = await env.DB.prepare('SELECT id FROM skills WHERE id = ?').bind(id).first();
  if (!existing) return notFound('Skill not found');

  const body = await parseBody<Partial<Skill>>(request);
  if (!body) return jsonError('Invalid JSON body');

  const fields = ['name', 'category', 'level', 'icon_url', 'sort_order'];
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
    `UPDATE skills SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  await invalidateCache(env, CACHE_KEYS.SKILLS);

  const updated = await env.DB.prepare('SELECT * FROM skills WHERE id = ?').bind(id).first<Skill>();
  return jsonResponse(updated);
}

export async function deleteSkill(request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  const auth = await authenticate(request, env);
  if (isAuthError(auth)) return auth;

  const id = parseInt(params.id);
  if (isNaN(id)) return jsonError('Invalid ID');

  const existing = await env.DB.prepare('SELECT id FROM skills WHERE id = ?').bind(id).first();
  if (!existing) return notFound('Skill not found');

  await env.DB.prepare('DELETE FROM skills WHERE id = ?').bind(id).run();
  await invalidateCache(env, CACHE_KEYS.SKILLS);

  return jsonMessage('Skill deleted successfully');
}
