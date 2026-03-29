// ============================================================
// KV Cache middleware
// ============================================================

import type { Env } from '../types';

const DEFAULT_TTL = 300; // 5 minutes

export async function getCached<T>(
  env: Env,
  key: string
): Promise<T | null> {
  try {
    const cached = await env.CACHE.get(key, 'json');
    return cached as T | null;
  } catch {
    return null;
  }
}

export async function setCache(
  env: Env,
  key: string,
  data: any,
  ttl = DEFAULT_TTL
): Promise<void> {
  try {
    await env.CACHE.put(key, JSON.stringify(data), {
      expirationTtl: ttl,
    });
  } catch {
    // Cache write failures should not break the app
  }
}

export async function invalidateCache(
  env: Env,
  ...keys: string[]
): Promise<void> {
  try {
    await Promise.all(keys.map(key => env.CACHE.delete(key)));
  } catch {
    // Cache delete failures should not break the app
  }
}

// Common cache keys
export const CACHE_KEYS = {
  PROFILE: 'cache:profile',
  EXPERIENCE: 'cache:experience',
  EDUCATION: 'cache:education',
  PROJECTS: 'cache:projects',
  SKILLS: 'cache:skills',
  ACHIEVEMENTS: 'cache:achievements',
  BLOG_LIST: 'cache:blog:list',
  blogPost: (slug: string) => `cache:blog:${slug}`,
  DASHBOARD_STATS: 'cache:dashboard:stats',
};
