// ============================================================
// Projects routes — CRUD /api/projects
// ============================================================

import type { Env, Project } from '../types';
import { jsonResponse, jsonError, notFound, jsonMessage } from '../utils/response';
import { authenticate, isAuthError } from '../middleware/auth';
import { getCached, setCache, invalidateCache, CACHE_KEYS } from '../middleware/cache';
import { parseBody, validateRequired } from '../utils/validation';

export async function listProjects(request: Request, env: Env): Promise<Response> {
  const cached = await getCached<Project[]>(env, CACHE_KEYS.PROJECTS);
  if (cached) return jsonResponse(cached);

  const { results } = await env.DB.prepare(
    'SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC'
  ).all<Project>();

  await setCache(env, CACHE_KEYS.PROJECTS, results, 600);
  return jsonResponse(results);
}

export async function createProject(request: Request, env: Env): Promise<Response> {
  const auth = await authenticate(request, env);
  if (isAuthError(auth)) return auth;

  const body = await parseBody<Partial<Project>>(request);
  if (!body) return jsonError('Invalid JSON body');

  const err = validateRequired(body, ['title']);
  if (err) return jsonError(err);

  const techStack = typeof body.tech_stack === 'string' ? body.tech_stack : JSON.stringify(body.tech_stack || []);
  const images = typeof body.images === 'string' ? body.images : JSON.stringify(body.images || []);

  const result = await env.DB.prepare(
    `INSERT INTO projects (title, description, tech_stack, images, live_url, github_url, playstore_url, is_featured, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    body.title, body.description || null, techStack, images,
    body.live_url || null, body.github_url || null,
    body.playstore_url || null, body.is_featured || 0, body.sort_order || 0
  ).run();

  await invalidateCache(env, CACHE_KEYS.PROJECTS);

  const created = await env.DB.prepare('SELECT * FROM projects WHERE id = ?')
    .bind(result.meta.last_row_id).first<Project>();
  return jsonResponse(created, 201);
}

export async function updateProject(request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  const auth = await authenticate(request, env);
  if (isAuthError(auth)) return auth;

  const id = parseInt(params.id);
  if (isNaN(id)) return jsonError('Invalid ID');

  const existing = await env.DB.prepare('SELECT id FROM projects WHERE id = ?').bind(id).first();
  if (!existing) return notFound('Project not found');

  const body = await parseBody<Partial<Project>>(request);
  if (!body) return jsonError('Invalid JSON body');

  const fields = ['title', 'description', 'tech_stack', 'images', 'live_url', 'github_url', 'playstore_url', 'is_featured', 'sort_order'];
  const updates: string[] = [];
  const values: any[] = [];

  for (const field of fields) {
    if ((body as any)[field] !== undefined) {
      let value = (body as any)[field];
      if ((field === 'tech_stack' || field === 'images') && typeof value !== 'string') {
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
    `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  await invalidateCache(env, CACHE_KEYS.PROJECTS);

  const updated = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first<Project>();
  return jsonResponse(updated);
}

export async function deleteProject(request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  const auth = await authenticate(request, env);
  if (isAuthError(auth)) return auth;

  const id = parseInt(params.id);
  if (isNaN(id)) return jsonError('Invalid ID');

  const existing = await env.DB.prepare('SELECT id FROM projects WHERE id = ?').bind(id).first();
  if (!existing) return notFound('Project not found');

  await env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(id).run();
  await invalidateCache(env, CACHE_KEYS.PROJECTS);

  return jsonMessage('Project deleted successfully');
}
