// ============================================================
// JWT implementation using Web Crypto API (HS256)
// Compatible with Cloudflare Workers runtime
// ============================================================

import type { JWTPayload } from '../types';

const ALGORITHM = { name: 'HMAC', hash: 'SHA-256' };
const TOKEN_EXPIRY = 24 * 60 * 60; // 24 hours in seconds

function base64urlEncode(data: string | ArrayBuffer): string {
  let str: string;
  if (typeof data === 'string') {
    str = btoa(data);
  } else {
    str = btoa(String.fromCharCode(...new Uint8Array(data)));
  }
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = str.length % 4;
  if (pad) str += '='.repeat(4 - pad);
  return atob(str);
}

async function getKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    ALGORITHM,
    false,
    ['sign', 'verify']
  );
}

export async function signJWT(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  secret: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + TOKEN_EXPIRY,
  };

  const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64urlEncode(JSON.stringify(fullPayload));
  const signingInput = `${header}.${body}`;

  const key = await getKey(secret);
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(signingInput)
  );

  return `${signingInput}.${base64urlEncode(signature)}`;
}

export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, sig] = parts;
    const signingInput = `${header}.${body}`;

    const key = await getKey(secret);
    const encoder = new TextEncoder();

    // Decode the signature
    const sigStr = base64urlDecode(sig);
    const sigBuffer = new Uint8Array(sigStr.length);
    for (let i = 0; i < sigStr.length; i++) {
      sigBuffer[i] = sigStr.charCodeAt(i);
    }

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBuffer,
      encoder.encode(signingInput)
    );

    if (!valid) return null;

    const payload: JWTPayload = JSON.parse(base64urlDecode(body));

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;

    return payload;
  } catch {
    return null;
  }
}
