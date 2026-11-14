import { describe, expect, it } from 'bun:test';
import { POST } from '@/app/api/v1/sign-up/route';
import { comparePassword } from '@/lib/auth';
import { findAccountByEmail } from '@/lib/supabase';

describe('Sign-Up Feature (specs/sign-up.md)', () => {
  it('should successfully create a new account with 201 status and valid fields', async () => {
    const payload = {
      first_name: 'Ana',
      last_name: 'Silva',
      email: `ana.silva.${Date.now()}@example.com`,
      password: 'StrongPassword123!',
      password_confirmation: 'StrongPassword123!',
    };

    const request = new Request('http://localhost:3000/api/v1/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.message).toBe('Conta criada com sucesso!');
    expect(body.account).toBeDefined();
    expect(body.account.id).toBeDefined();
    expect(typeof body.account.id).toBe('string');
    expect(body.account.first_name).toBe('Ana');
    expect(body.account.last_name).toBe('Silva');
    expect(body.account.email).toBe(payload.email.toLowerCase());
    // Security check: passwords and salts should never be exposed in the response
    expect(body.account.password).toBeUndefined();
    expect(body.account.salt).toBeUndefined();

    // Verify stored account in database
    const savedAccount = await findAccountByEmail(payload.email);
    expect(savedAccount).not.toBeNull();
    expect(savedAccount?.salt).toBeDefined();
    expect(savedAccount?.password).toBeDefined();
    expect(savedAccount?.password).not.toBe(payload.password);

    // Verify bcrypt hash comparison
    const isPasswordValid = await comparePassword(
      payload.password,
      savedAccount ? savedAccount.password : '',
    );
    expect(isPasswordValid).toBe(true);
  });

  it('should return 400 when body is malformed or invalid JSON', async () => {
    const request = new Request('http://localhost:3000/api/v1/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json',
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain('Má formatação de dados');
  });

  it('should return 400 when validation fails (passwords do not match)', async () => {
    const payload = {
      first_name: 'Carlos',
      last_name: 'Souza',
      email: `carlos.${Date.now()}@example.com`,
      password: 'Password123!',
      password_confirmation: 'DifferentPassword456!',
    };

    const request = new Request('http://localhost:3000/api/v1/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Dados inválidos fornecidos no formulário.');
    expect(body.details.password_confirmation._errors).toContain('As senhas não coincidem');
  });

  it('should return 400 when email is invalid', async () => {
    const payload = {
      first_name: 'Carlos',
      last_name: 'Souza',
      email: 'not-an-email',
      password: 'Password123!',
      password_confirmation: 'Password123!',
    };

    const request = new Request('http://localhost:3000/api/v1/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.details.email._errors).toContain('Informe um e-mail válido');
  });

  it('should return 409 when attempting to create an account with an existing email', async () => {
    const existingEmail = `duplicate.${Date.now()}@example.com`;
    const payload = {
      first_name: 'Lucas',
      last_name: 'Ferreira',
      email: existingEmail,
      password: 'Password123!',
      password_confirmation: 'Password123!',
    };

    // First registration
    const req1 = new Request('http://localhost:3000/api/v1/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const res1 = await POST(req1);
    expect(res1.status).toBe(201);

    // Duplicate registration attempt
    const req2 = new Request('http://localhost:3000/api/v1/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(409);
    const body2 = await res2.json();
    expect(body2.error).toContain('já está cadastrado');
  });
});
