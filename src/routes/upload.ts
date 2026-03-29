// ============================================================
// Upload routes — R2 file management
// ============================================================

import type { Env } from '../types';
import { jsonResponse, jsonError, jsonMessage } from '../utils/response';
import { authenticate, isAuthError } from '../middleware/auth';

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadFile(request: Request, env: Env): Promise<Response> {
  if (!env.R2) return jsonError('File storage (R2) is not configured', 503);
  const auth = await authenticate(request, env);
  if (isAuthError(auth)) return auth;

  const contentType = request.headers.get('Content-Type') || '';

  if (contentType.includes('multipart/form-data')) {
    // Handle multipart form upload
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return jsonError('No file provided');
    if (file.size > MAX_FILE_SIZE) return jsonError('File too large (max 10MB)');
    if (!ALLOWED_TYPES.includes(file.type)) {
      return jsonError(`File type not allowed. Allowed: ${ALLOWED_TYPES.join(', ')}`);
    }

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `uploads/${timestamp}-${safeName}`;

    await env.R2.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    return jsonResponse({
      key,
      url: `/api/files/${key}`,
      name: file.name,
      size: file.size,
      type: file.type,
    }, 201);
  }

  // Handle raw binary upload with headers
  const fileName = request.headers.get('X-File-Name') || `file-${Date.now()}`;
  const fileType = request.headers.get('X-File-Type') || 'application/octet-stream';

  if (!ALLOWED_TYPES.includes(fileType)) {
    return jsonError(`File type not allowed`);
  }

  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `uploads/${timestamp}-${safeName}`;

  const body = await request.arrayBuffer();
  if (body.byteLength > MAX_FILE_SIZE) return jsonError('File too large (max 10MB)');

  await env.R2.put(key, body, {
    httpMetadata: { contentType: fileType },
    customMetadata: {
      originalName: fileName,
      uploadedAt: new Date().toISOString(),
    },
  });

  return jsonResponse({
    key,
    url: `/api/files/${key}`,
    name: fileName,
    size: body.byteLength,
    type: fileType,
  }, 201);
}

export async function getFile(request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  const key = params.key;
  if (!key) return jsonError('File key required');

  if (!env.R2) return jsonError('File storage (R2) is not configured', 503);

  const object = await env.R2.get(key);
  if (!object) return jsonError('File not found', 404);

  const headers = new Headers();
  headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('ETag', object.etag);

  return new Response(object.body, { headers });
}

export async function deleteFile(request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  const auth = await authenticate(request, env);
  if (isAuthError(auth)) return auth;

  const key = params.key;
  if (!key) return jsonError('File key required');

  if (!env.R2) return jsonError('File storage (R2) is not configured', 503);

  await env.R2.delete(key);
  return jsonMessage('File deleted successfully');
}
