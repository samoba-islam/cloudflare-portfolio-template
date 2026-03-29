// ============================================================
// Auth routes — POST /api/login, POST /api/setup
// ============================================================

import type { Env, User } from '../types';
import { jsonResponse, jsonError, unauthorized } from '../utils/response';
import { hashPassword, verifyPassword } from '../utils/password';
import { signJWT } from '../utils/jwt';
import { parseBody, validateRequired, validateEmail } from '../utils/validation';
import { authenticate, isAuthError } from '../middleware/auth';

export async function handleLogin(request: Request, env: Env): Promise<Response> {
  const body = await parseBody<{ email: string; password: string }>(request);
  if (!body) return jsonError('Invalid JSON body');

  const validationError = validateRequired(body, ['email', 'password']);
  if (validationError) return jsonError(validationError);

  if (!validateEmail(body.email)) return jsonError('Invalid email format');

  // Find user
  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
    .bind(body.email)
    .first<User>();

  if (!user) return unauthorized('Invalid credentials');

  // Verify password
  const valid = await verifyPassword(body.password, user.password_hash);
  if (!valid) return unauthorized('Invalid credentials');

  // Generate JWT
  const token = await signJWT({ sub: user.id, email: user.email }, env.JWT_SECRET);

  return jsonResponse({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
}

// One-time setup endpoint to create/update admin account
export async function handleSetup(request: Request, env: Env): Promise<Response> {
  const body = await parseBody<{ email: string; password: string; name: string; setup_key: string }>(request);
  if (!body) return jsonError('Invalid JSON body');

  // Require JWT_SECRET as the setup key for security
  if (body.setup_key !== env.JWT_SECRET) {
    return unauthorized('Invalid setup key');
  }

  const validationError = validateRequired(body, ['email', 'password', 'name']);
  if (validationError) return jsonError(validationError);

  if (!validateEmail(body.email)) return jsonError('Invalid email format');
  if (body.password.length < 8) return jsonError('Password must be at least 8 characters');

  const passwordHash = await hashPassword(body.password);

  // Upsert admin user
  await env.DB.prepare(
    `INSERT INTO users (email, password_hash, name, updated_at) 
     VALUES (?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(email) DO UPDATE SET 
       password_hash = excluded.password_hash, 
       name = excluded.name,
       updated_at = CURRENT_TIMESTAMP`
  ).bind(body.email, passwordHash, body.name).run();

  return jsonResponse({ message: 'Admin account created successfully' });
}

// Update Admin Credentials (Email / Password)
export async function updateAdminCredentials(request: Request, env: Env): Promise<Response> {
  const auth = await authenticate(request, env);
  if (isAuthError(auth)) return auth;

  const body = await parseBody<{
    newEmail: string;
    currentPassword?: string;
    newPassword?: string;
  }>(request);

  if (!body) return jsonError('Invalid JSON body');

  const validationError = validateRequired(body, ['newEmail', 'currentPassword']);
  if (validationError) return jsonError(validationError);

  if (!validateEmail(body.newEmail)) return jsonError('Invalid email format');
  if (body.newPassword && body.newPassword.length < 8) return jsonError('New password must be at least 8 characters');

  // Find user
  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?')
    .bind(auth.sub)
    .first<User>();

  if (!user) return unauthorized('User not found');

  // Verify current password
  if (!body.currentPassword) return unauthorized('Current password is required');
  const valid = await verifyPassword(body.currentPassword, user.password_hash);
  if (!valid) return unauthorized('Invalid current password');

  let passwordHash = user.password_hash;
  if (body.newPassword) {
    passwordHash = await hashPassword(body.newPassword);
  }

  // Update user
  await env.DB.prepare(
    `UPDATE users 
     SET email = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`
  ).bind(body.newEmail, passwordHash, auth.sub).run();

  return jsonResponse({ message: 'Credentials updated successfully' });
}
