// ============================================================
// Profile routes — GET/PUT /api/profile
// ============================================================

import type { Env, Profile } from '../types';
import { jsonResponse, jsonError, notFound } from '../utils/response';
import { authenticate, isAuthError } from '../middleware/auth';
import { getCached, setCache, invalidateCache, CACHE_KEYS } from '../middleware/cache';
import { parseBody } from '../utils/validation';

export async function getProfile(request: Request, env: Env): Promise<Response> {
  // Check cache first
  const cached = await getCached<Profile>(env, CACHE_KEYS.PROFILE);
  if (cached) return jsonResponse(cached);

  const profile = await env.DB.prepare('SELECT * FROM profile WHERE id = 1').first<Profile>();
  if (!profile) return notFound('Profile not found');

  // Cache for 10 minutes
  await setCache(env, CACHE_KEYS.PROFILE, profile, 600);

  return jsonResponse(profile);
}

export async function updateProfile(request: Request, env: Env): Promise<Response> {
  const auth = await authenticate(request, env);
  if (isAuthError(auth)) return auth;

  const body = await parseBody<Partial<Profile>>(request);
  if (!body) return jsonError('Invalid JSON body');

  const fields = [
    'name', 'title', 'bio', 'tagline', 'profile_image_url', 'cv_url',
    'email', 'phone', 'location', 'github_url', 'linkedin_url',
    'facebook_url', 'twitter_url', 'website_url'
  ];

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
  values.push(1); // WHERE id = 1

  await env.DB.prepare(
    `UPDATE profile SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  await invalidateCache(env, CACHE_KEYS.PROFILE);

  const updated = await env.DB.prepare('SELECT * FROM profile WHERE id = 1').first<Profile>();
  return jsonResponse(updated);
}
