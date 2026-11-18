import crypto from 'node:crypto';
import type { NextResponse } from 'next/server';

export interface SessionUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface SessionPayload {
  user: SessionUser;
  exp: number;
}

export const AUTH_COOKIE_NAME = 'auth_session';
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

const SESSION_SECRET =
  process.env.SESSION_SECRET || 'super-secret-session-key-for-modulo-engajamento-eval-2026';

/**
 * Creates a signed HMAC-SHA256 session token from a SessionUser payload.
 */
export function createSessionToken(user: SessionUser): string {
  const payload: SessionPayload = {
    user: {
      id: user.id,
      email: user.email.toLowerCase().trim(),
      first_name: user.first_name,
      last_name: user.last_name,
    },
    exp: Date.now() + AUTH_COOKIE_MAX_AGE * 1000,
  };

  const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadEncoded)
    .digest('base64url');

  return `${payloadEncoded}.${signature}`;
}

/**
 * Verifies and decodes a signed HMAC-SHA256 session token.
 * Returns null if token is invalid, tampered or expired.
 */
export function verifySessionToken(token: string): SessionUser | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadEncoded, signature] = parts;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadEncoded)
      .digest('base64url');

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }

    const payloadJson = Buffer.from(payloadEncoded, 'base64url').toString('utf-8');
    const payload: SessionPayload = JSON.parse(payloadJson);

    if (!payload.user || !payload.exp) return null;
    if (Date.now() > payload.exp) return null;

    return payload.user;
  } catch {
    return null;
  }
}

/**
 * Parses raw Cookie header string into key-value pairs.
 */
export function parseCookieHeader(header: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!header) return result;

  const pairs = header.split(';');
  for (const pair of pairs) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    result[key] = decodeURIComponent(val);
  }
  return result;
}

/**
 * Retrieves the currently authenticated session user from request or Next.js cookies.
 */
export async function getSessionUser(request?: Request): Promise<SessionUser | null> {
  let token: string | undefined;

  if (request) {
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const parsed = parseCookieHeader(cookieHeader);
      token = parsed[AUTH_COOKIE_NAME];
    }
  }

  if (!token) {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = cookies();
      token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    } catch {
      // Ignore when outside Next.js request context
    }
  }

  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Sets session cookie on a NextResponse or Headers object.
 */
export function setSessionCookie(user: SessionUser, target?: Headers | NextResponse): string {
  const token = createSessionToken(user);
  if (!target) return token;

  const isProd = process.env.NODE_ENV === 'production';

  if ('cookies' in target && typeof target.cookies?.set === 'function') {
    target.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: AUTH_COOKIE_MAX_AGE,
    });
  } else if ('append' in target && typeof target.append === 'function') {
    target.append(
      'Set-Cookie',
      `${AUTH_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${AUTH_COOKIE_MAX_AGE}${isProd ? '; Secure' : ''}`,
    );
  }

  return token;
}

/**
 * Clears the session cookie on a NextResponse or Headers object.
 */
export function clearSessionCookie(target?: Headers | NextResponse): void {
  if (!target) return;

  const isProd = process.env.NODE_ENV === 'production';

  if ('cookies' in target && typeof target.cookies?.delete === 'function') {
    target.cookies.delete(AUTH_COOKIE_NAME);
  } else if ('append' in target && typeof target.append === 'function') {
    target.append(
      'Set-Cookie',
      `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${isProd ? '; Secure' : ''}`,
    );
  }
}
