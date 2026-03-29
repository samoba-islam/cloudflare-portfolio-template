// ============================================================
// Blog routes — CRUD /api/blog
// ============================================================

import type { Env, BlogPost } from '../types';
import { jsonResponse, jsonError, notFound, jsonMessage } from '../utils/response';
import { authenticate, isAuthError } from '../middleware/auth';
import { getCached, setCache, invalidateCache, CACHE_KEYS } from '../middleware/cache';
import { parseBody, validateRequired, generateSlug } from '../utils/validation';

export async function listBlogPosts(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const tag = url.searchParams.get('tag');
  const search = url.searchParams.get('search');
  const includeUnpublished = url.searchParams.get('all') === 'true';

  // Only serve published posts for public, admin can see all
  let query = 'SELECT * FROM blog_posts';
  const conditions: string[] = [];
  const bindings: any[] = [];

  if (!includeUnpublished) {
    // Public: check auth header to decide
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      conditions.push('is_published = 1');
    }
  }

  if (tag) {
    conditions.push("tags LIKE ?");
    bindings.push(`%"${tag}"%`);
  }

  if (search) {
    conditions.push('(title LIKE ? OR content LIKE ?)');
    bindings.push(`%${search}%`, `%${search}%`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY published_at DESC, created_at DESC';

  // Pagination
  const offset = (page - 1) * limit;
  query += ` LIMIT ? OFFSET ?`;
  bindings.push(limit, offset);

  const { results } = await env.DB.prepare(query).bind(...bindings).all<BlogPost>();

  // Get total count for pagination
  let countQuery = 'SELECT COUNT(*) as total FROM blog_posts';
  if (conditions.length > 0) {
    countQuery += ' WHERE ' + conditions.join(' AND ');
  }
  const countBindings = bindings.slice(0, -2); // Remove limit and offset
  const countResult = await env.DB.prepare(countQuery).bind(...countBindings).first<{ total: number }>();

  return jsonResponse({
    posts: results,
    pagination: {
      page,
      limit,
      total: countResult?.total || 0,
      totalPages: Math.ceil((countResult?.total || 0) / limit),
    },
  });
}

export async function getBlogPost(request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  const slug = params.slug;

  const cached = await getCached<BlogPost>(env, CACHE_KEYS.blogPost(slug));
  if (cached) return jsonResponse(cached);

  const post = await env.DB.prepare(
    'SELECT * FROM blog_posts WHERE slug = ? AND is_published = 1'
  ).bind(slug).first<BlogPost>();

  if (!post) return notFound('Blog post not found');

  await setCache(env, CACHE_KEYS.blogPost(slug), post, 600);
  return jsonResponse(post);
}

export async function createBlogPost(request: Request, env: Env): Promise<Response> {
  const auth = await authenticate(request, env);
  if (isAuthError(auth)) return auth;

  const body = await parseBody<Partial<BlogPost> & { title: string; content: string }>(request);
  if (!body) return jsonError('Invalid JSON body');

  const err = validateRequired(body, ['title', 'content']);
  if (err) return jsonError(err);

  const slug = body.slug || generateSlug(body.title);
  const tags = typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags || []);

  // Check slug uniqueness
  const existingSlug = await env.DB.prepare('SELECT id FROM blog_posts WHERE slug = ?').bind(slug).first();
  if (existingSlug) return jsonError('A blog post with this slug already exists');

  const result = await env.DB.prepare(
    `INSERT INTO blog_posts (title, slug, content, excerpt, cover_image_url, tags, is_published, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    body.title, slug, body.content, body.excerpt || null,
    body.cover_image_url || null, tags,
    body.is_published || 0,
    body.is_published ? new Date().toISOString() : null
  ).run();

  await invalidateCache(env, CACHE_KEYS.BLOG_LIST);

  const created = await env.DB.prepare('SELECT * FROM blog_posts WHERE id = ?')
    .bind(result.meta.last_row_id).first<BlogPost>();
  return jsonResponse(created, 201);
}

export async function updateBlogPost(request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  const auth = await authenticate(request, env);
  if (isAuthError(auth)) return auth;

  const id = parseInt(params.id);
  if (isNaN(id)) return jsonError('Invalid ID');

  const existing = await env.DB.prepare('SELECT * FROM blog_posts WHERE id = ?').bind(id).first<BlogPost>();
  if (!existing) return notFound('Blog post not found');

  const body = await parseBody<Partial<BlogPost>>(request);
  if (!body) return jsonError('Invalid JSON body');

  const fields = ['title', 'slug', 'content', 'excerpt', 'cover_image_url', 'tags', 'is_published'];
  const updates: string[] = [];
  const values: any[] = [];

  for (const field of fields) {
    if ((body as any)[field] !== undefined) {
      let value = (body as any)[field];
      if (field === 'tags' && typeof value !== 'string') {
        value = JSON.stringify(value);
      }
      updates.push(`${field} = ?`);
      values.push(value);
    }
  }

  // Auto-set published_at when publishing for the first time
  if (body.is_published === 1 && !existing.published_at) {
    updates.push('published_at = CURRENT_TIMESTAMP');
  }

  if (updates.length === 0) return jsonError('No fields to update');
  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  await env.DB.prepare(
    `UPDATE blog_posts SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  await invalidateCache(env, CACHE_KEYS.BLOG_LIST, CACHE_KEYS.blogPost(existing.slug));
  if (body.slug && body.slug !== existing.slug) {
    await invalidateCache(env, CACHE_KEYS.blogPost(body.slug));
  }

  const updated = await env.DB.prepare('SELECT * FROM blog_posts WHERE id = ?').bind(id).first<BlogPost>();
  return jsonResponse(updated);
}

export async function deleteBlogPost(request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  const auth = await authenticate(request, env);
  if (isAuthError(auth)) return auth;

  const id = parseInt(params.id);
  if (isNaN(id)) return jsonError('Invalid ID');

  const existing = await env.DB.prepare('SELECT * FROM blog_posts WHERE id = ?').bind(id).first<BlogPost>();
  if (!existing) return notFound('Blog post not found');

  await env.DB.prepare('DELETE FROM blog_posts WHERE id = ?').bind(id).run();
  await invalidateCache(env, CACHE_KEYS.BLOG_LIST, CACHE_KEYS.blogPost(existing.slug));

  return jsonMessage('Blog post deleted successfully');
}
