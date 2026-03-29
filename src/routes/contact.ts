// ============================================================
// Contact routes — POST /api/contact, GET /api/contacts
// ============================================================

import type { Env, Contact } from '../types';
import { jsonResponse, jsonError, notFound, jsonMessage } from '../utils/response';
import { authenticate, isAuthError } from '../middleware/auth';
import { parseBody, validateRequired, validateEmail, sanitizeString } from '../utils/validation';

export async function submitContact(request: Request, env: Env): Promise<Response> {
  const body = await parseBody<Partial<Contact>>(request);
  if (!body) return jsonError('Invalid JSON body');

  const err = validateRequired(body, ['name', 'email', 'message']);
  if (err) return jsonError(err);

  if (!validateEmail(body.email!)) return jsonError('Invalid email format');

  const name = sanitizeString(body.name!);
  const email = sanitizeString(body.email!);
  const subject = body.subject ? sanitizeString(body.subject) : null;
  const message = sanitizeString(body.message!);

  await env.DB.prepare(
    `INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)`
  ).bind(name, email, subject, message).run();

  return jsonMessage('Message sent successfully! I will get back to you soon.', 201);
}

export async function listContacts(request: Request, env: Env): Promise<Response> {
  const auth = await authenticate(request, env);
  if (isAuthError(auth)) return auth;

  const url = new URL(request.url);
  const unreadOnly = url.searchParams.get('unread') === 'true';

  let query = 'SELECT * FROM contacts';
  if (unreadOnly) query += ' WHERE is_read = 0';
  query += ' ORDER BY created_at DESC';

  const { results } = await env.DB.prepare(query).all<Contact>();

  // Also get count of unread
  const unreadCount = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM contacts WHERE is_read = 0'
  ).first<{ count: number }>();

  return jsonResponse({
    contacts: results,
    unread_count: unreadCount?.count || 0,
  });
}

export async function markContactRead(request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  const auth = await authenticate(request, env);
  if (isAuthError(auth)) return auth;

  const id = parseInt(params.id);
  if (isNaN(id)) return jsonError('Invalid ID');

  const existing = await env.DB.prepare('SELECT id FROM contacts WHERE id = ?').bind(id).first();
  if (!existing) return notFound('Contact not found');

  await env.DB.prepare('UPDATE contacts SET is_read = 1 WHERE id = ?').bind(id).run();

  return jsonMessage('Contact marked as read');
}

export async function deleteContact(request: Request, env: Env, params: Record<string, string>): Promise<Response> {
  const auth = await authenticate(request, env);
  if (isAuthError(auth)) return auth;

  const id = parseInt(params.id);
  if (isNaN(id)) return jsonError('Invalid ID');

  const existing = await env.DB.prepare('SELECT id FROM contacts WHERE id = ?').bind(id).first();
  if (!existing) return notFound('Contact not found');

  await env.DB.prepare('DELETE FROM contacts WHERE id = ?').bind(id).run();
  return jsonMessage('Contact deleted successfully');
}
