import { comparePassword } from '@/lib/auth';
import { setSessionCookie } from '@/lib/session';
import { findAccountByEmail } from '@/lib/supabase';
import { signInSchema } from '@/lib/validations/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);

    if (!rawBody || typeof rawBody !== 'object') {
      return NextResponse.json(
        {
          error: 'Má formatação de dados. O corpo da requisição deve ser um JSON válido.',
        },
        { status: 400 },
      );
    }

    const validation = signInSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos fornecidos no formulário.',
          details: validation.error.format(),
        },
        { status: 400 },
      );
    }

    const { email, password } = validation.data;

    // Retrieve account by email
    const account = await findAccountByEmail(email);

    // If account not found, return generic 401 error
    if (!account) {
      return NextResponse.json(
        {
          error: 'Email ou senha inválidos.',
        },
        { status: 401 },
      );
    }

    // Compare passwords with bcrypt
    const isPasswordValid = await comparePassword(password, account.password);

    // If password mismatch, return generic 401 error
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          error: 'Email ou senha inválidos.',
        },
        { status: 401 },
      );
    }

    // Prepare session user payload
    const sessionUser = {
      id: account.id,
      first_name: account.first_name,
      last_name: account.last_name,
      email: account.email,
    };

    const response = NextResponse.json(
      {
        message: 'Autenticação realizada com sucesso!',
        user: sessionUser,
      },
      { status: 200 },
    );

    // Attach HttpOnly auth_session cookie
    setSessionCookie(sessionUser, response);

    return response;
  } catch (error) {
    console.error('[Sign-In API Error]:', error);
    return NextResponse.json(
      {
        error: 'Ocorreu um erro interno ao processar a autenticação. Tente novamente.',
      },
      { status: 500 },
    );
  }
}
