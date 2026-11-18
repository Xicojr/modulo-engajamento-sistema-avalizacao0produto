import { createFeedback, getFeedbackStats, listFeedbacksByProductId } from '@/lib/feedbacks';
import { findProductById } from '@/lib/products';
import { getSessionUser } from '@/lib/session';
import { feedbackSchema } from '@/lib/validations/feedback';
import { nanoid } from 'nanoid';
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

    const feedbacks = await listFeedbacksByProductId(id);
    const stats = await getFeedbackStats(id);

    return NextResponse.json(
      {
        feedbacks,
        stats,
        averageScore: stats.averageScore,
        totalCount: stats.totalCount,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[API Feedbacks GET] Erro ao listar feedbacks:', error);
    return NextResponse.json(
      { error: 'Erro interno ao consultar avaliações do produto.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const params = await Promise.resolve(context.params);
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: 'ID do produto é obrigatório.' }, { status: 400 });
    }

    // 1. Verificação de autenticação via sessão HTTP-only
    const sessionUser = await getSessionUser(request);

    if (!sessionUser) {
      return NextResponse.json(
        { error: 'Você precisa estar autenticado para enviar uma avaliação.' },
        { status: 401 },
      );
    }

    // 2. Verificação da existência do produto
    const product = await findProductById(id);
    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado para avaliação.' },
        { status: 404 },
      );
    }

    // 3. Validação do corpo da requisição
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Formato de requisição inválido. Esperado JSON válido.' },
        { status: 400 },
      );
    }

    const parseResult = feedbackSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos fornecidos para a avaliação.',
          details: parseResult.error.format(),
        },
        { status: 400 },
      );
    }

    // 4. Criação do feedback persistido
    const { score, comment } = parseResult.data;
    const newFeedback = await createFeedback({
      id: nanoid(),
      score,
      comment,
      created_by: sessionUser.id,
      product_id: id,
      author: {
        first_name: sessionUser.first_name,
        last_name: sessionUser.last_name,
        email: sessionUser.email,
      },
    });

    return NextResponse.json(
      {
        message: 'Avaliação registrada com sucesso!',
        feedback: newFeedback,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[API Feedbacks POST] Erro ao criar avaliação:', error);
    return NextResponse.json({ error: 'Erro interno ao registrar a avaliação.' }, { status: 500 });
  }
}
