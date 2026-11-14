import { hashPassword } from '@/lib/auth';
import { findAccountByEmail, insertAccount } from '@/lib/supabase';
import { signUpSchema } from '@/lib/validations/auth';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';

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

    const validation = signUpSchema.safeParse(rawBody);

    if (!validation.success) {
      const formattedErrors = validation.error.format();
      return NextResponse.json(
        {
          error: 'Dados inválidos fornecidos no formulário.',
          details: formattedErrors,
        },
        { status: 400 },
      );
    }

    const { first_name, last_name, email, password } = validation.data;

    // Check if email is already registered
    const existingAccount = await findAccountByEmail(email);
    if (existingAccount) {
      return NextResponse.json(
        {
          error: 'Este endereço de e-mail já está cadastrado na plataforma.',
        },
        { status: 409 },
      );
    }

    // Generate nanoid id on the API layer
    const id = nanoid();

    // Hash password with bcrypt and generate salt
    const { salt, hash: passwordHash } = await hashPassword(password);

    // Persist new account in database
    const createdAccount = await insertAccount({
      id,
      first_name,
      last_name,
      email,
      password: passwordHash,
      salt,
    });

    return NextResponse.json(
      {
        message: 'Conta criada com sucesso!',
        account: {
          id: createdAccount.id,
          first_name: createdAccount.first_name,
          last_name: createdAccount.last_name,
          email: createdAccount.email,
          created_at: createdAccount.created_at,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[Sign-Up API Error]:', error);
    return NextResponse.json(
      {
        error: 'Ocorreu um erro interno ao processar a criação de conta. Tente novamente.',
      },
      { status: 500 },
    );
  }
}
