import { describe, expect, it } from 'bun:test';
import { GET as authMeGET } from '@/app/api/v1/auth/me/route';
import { POST as signOutPOST } from '@/app/api/v1/auth/sign-out/route';
import { POST as signInPOST } from '@/app/api/v1/sign-in/route';
import { hashPassword } from '@/lib/auth';
import {
  AUTH_COOKIE_NAME,
  createSessionToken,
  parseCookieHeader,
  verifySessionToken,
} from '@/lib/session';
import { insertAccount } from '@/lib/supabase';
import { nanoid } from 'nanoid';

describe('Sign-In Feature (specs/sign-in.md & plans/sign-in.md)', () => {
  it('should return 400 when body is malformed or not a valid JSON', async () => {
    const request = new Request('http://localhost:3000/api/v1/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json-body{',
    });

    const response = await signInPOST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain('Má formatação de dados');
  });

  it('should return 400 when email or password is missing or invalid', async () => {
    // Test invalid email format
    const req1 = new Request('http://localhost:3000/api/v1/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalid-email', password: 'password123' }),
    });

    const res1 = await signInPOST(req1);
    const body1 = await res1.json();
    expect(res1.status).toBe(400);
    expect(body1.error).toBe('Dados inválidos fornecidos no formulário.');
    expect(body1.details.email._errors).toContain('Informe um e-mail válido');

    // Test missing password
    const req2 = new Request('http://localhost:3000/api/v1/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'valid@example.com', password: '' }),
    });

    const res2 = await signInPOST(req2);
    const body2 = await res2.json();
    expect(res2.status).toBe(400);
    expect(body2.details.password._errors).toContain('Senha é obrigatória');
  });

  it('should return 401 with generic error message when account does not exist', async () => {
    const request = new Request('http://localhost:3000/api/v1/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `nonexistent.${Date.now()}@example.com`,
        password: 'Password123!',
      }),
    });

    const response = await signInPOST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    // Requirement 2: Must be generic and not reveal whether email or password failed
    expect(body.error).toBe('Email ou senha inválidos.');
  });

  it('should return 401 with generic error message when password does not match', async () => {
    const email = `user.wrongpwd.${Date.now()}@example.com`;
    const password = 'CorrectPassword123!';
    const { salt, hash } = await hashPassword(password);

    await insertAccount({
      id: nanoid(),
      first_name: 'Marcos',
      last_name: 'Oliveira',
      email,
      password: hash,
      salt,
    });

    const request = new Request('http://localhost:3000/api/v1/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'IncorrectPassword456!',
      }),
    });

    const response = await signInPOST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    // Requirement 2: Must be identical generic error message
    expect(body.error).toBe('Email ou senha inválidos.');
  });

  it('should successfully authenticate with 200, set auth_session cookie, and return user data', async () => {
    const email = `maria.login.${Date.now()}@example.com`;
    const password = 'MySecretPassword123!';
    const { salt, hash } = await hashPassword(password);

    const created = await insertAccount({
      id: nanoid(),
      first_name: 'Maria',
      last_name: 'Fernandes',
      email,
      password: hash,
      salt,
    });

    const request = new Request('http://localhost:3000/api/v1/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const response = await signInPOST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe('Autenticação realizada com sucesso!');
    expect(body.user).toBeDefined();
    expect(body.user.id).toBe(created.id);
    expect(body.user.first_name).toBe('Maria');
    expect(body.user.last_name).toBe('Fernandes');
    expect(body.user.email).toBe(email.toLowerCase());
    expect(body.user.password).toBeUndefined();
    expect(body.user.salt).toBeUndefined();

    // Verify Set-Cookie header contains auth_session
    const setCookieHeader = response.headers.get('set-cookie');
    expect(setCookieHeader).not.toBeNull();
    expect(setCookieHeader).toContain(`${AUTH_COOKIE_NAME}=`);
    expect(setCookieHeader).toContain('Path=/');
    expect(setCookieHeader).toContain('HttpOnly');

    // Verify decoded token matches session user
    const cookies = parseCookieHeader(setCookieHeader || '');
    const token = cookies[AUTH_COOKIE_NAME];
    expect(token).toBeDefined();

    const sessionUser = verifySessionToken(token);
    expect(sessionUser).not.toBeNull();
    expect(sessionUser?.id).toBe(created.id);
    expect(sessionUser?.email).toBe(email.toLowerCase());
    expect(sessionUser?.first_name).toBe('Maria');
    expect(sessionUser?.last_name).toBe('Fernandes');
  });

  it('should verify session with GET /api/v1/auth/me', async () => {
    const testUser = {
      id: nanoid(),
      first_name: 'Roberto',
      last_name: 'Santos',
      email: 'roberto.santos@example.com',
    };
    const validToken = createSessionToken(testUser);

    // 1. Authenticated request
    const authRequest = new Request('http://localhost:3000/api/v1/auth/me', {
      headers: {
        cookie: `${AUTH_COOKIE_NAME}=${validToken}`,
      },
    });

    const authRes = await authMeGET(authRequest);
    const authBody = await authRes.json();

    expect(authRes.status).toBe(200);
    expect(authBody.user).not.toBeNull();
    expect(authBody.user.id).toBe(testUser.id);
    expect(authBody.user.email).toBe(testUser.email);

    // 2. Unauthenticated request (no cookie)
    const guestRequest = new Request('http://localhost:3000/api/v1/auth/me');
    const guestRes = await authMeGET(guestRequest);
    const guestBody = await guestRes.json();

    expect(guestRes.status).toBe(200);
    expect(guestBody.user).toBeNull();

    // 3. Request with tampered/invalid token
    const tamperedRequest = new Request('http://localhost:3000/api/v1/auth/me', {
      headers: {
        cookie: `${AUTH_COOKIE_NAME}=invalid.tampered.token`,
      },
    });
    const tamperedRes = await authMeGET(tamperedRequest);
    const tamperedBody = await tamperedRes.json();

    expect(tamperedRes.status).toBe(200);
    expect(tamperedBody.user).toBeNull();
  });

  it('should clear session with POST /api/v1/auth/sign-out', async () => {
    const response = await signOutPOST();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe('Sessão encerrada com sucesso.');

    const setCookie = response.headers.get('set-cookie');
    expect(setCookie).not.toBeNull();
    // Cookie must be cleared / expired
    const isCleared =
      setCookie?.includes('Max-Age=0') ||
      setCookie?.includes('Expires=Thu, 01 Jan 1970 00:00:00 GMT') ||
      setCookie?.includes(`${AUTH_COOKIE_NAME}=;`);
    expect(isCleared).toBe(true);
  });
});
