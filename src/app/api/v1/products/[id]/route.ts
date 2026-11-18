import { findProductById } from '@/lib/products';
import { NextResponse } from 'next/server';

interface RouteContext {
  params: { id: string } | Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const params = await Promise.resolve(context.params);
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: 'ID do produto é obrigatório.' }, { status: 400 });
    }

    const product = await findProductById(id);

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    console.error('[API Products GET by ID] Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno ao buscar detalhes do produto.' },
      { status: 500 },
    );
  }
}
