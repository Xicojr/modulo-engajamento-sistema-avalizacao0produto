import { clearSessionCookie } from '@/lib/session';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const response = NextResponse.json(
      {
        message: 'Sessão encerrada com sucesso.',
      },
      { status: 200 },
    );

    clearSessionCookie(response);

    return response;
  } catch (error) {
    console.error('[Sign-Out API Error]:', error);
    return NextResponse.json(
      {
        error: 'Erro ao encerrar a sessão.',
      },
      { status: 500 },
    );
  }
}
