import { getFeedbackStats, listFeedbacksByProductId } from '@/lib/feedbacks';
import { generateProductReviewSummary } from '@/lib/mastra/agent';
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

    // 1. Verifica se o produto existe
    const product = await findProductById(id);
    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    }

    // 2. Busca todas as avaliações e estatísticas do produto
    const feedbacks = await listFeedbacksByProductId(id);
    const stats = await getFeedbackStats(id);

    // 3. Caso não haja avaliações suficientes para gerar resumo
    if (feedbacks.length === 0) {
      return NextResponse.json(
        {
          productId: id,
          productName: product.name,
          totalReviews: 0,
          averageScore: 0,
          hasReviews: false,
          summary: null,
          message:
            'Ainda não há avaliações cadastradas para este produto. O resumo da IA será disponibilizado assim que os primeiros feedbacks forem publicados.',
        },
        { status: 200 },
      );
    }

    // 4. Executa a síntese via Agente Mastra + GPT-4o-mini
    const result = await generateProductReviewSummary(product, feedbacks);

    return NextResponse.json(
      {
        productId: id,
        productName: product.name,
        totalReviews: feedbacks.length,
        averageScore: stats.averageScore,
        hasReviews: true,
        summary: result.summary,
        isFallback: result.isFallback,
        model: result.model,
        provider: result.provider,
        notice: result.notice,
        generatedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[API Product AI Summary GET] Erro ao sintetizar feedbacks:', error);
    return NextResponse.json(
      { error: 'Erro interno ao gerar o resumo inteligente do produto.' },
      { status: 500 },
    );
  }
}
