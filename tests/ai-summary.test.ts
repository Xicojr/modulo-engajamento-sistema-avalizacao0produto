import { describe, expect, it } from 'bun:test';
import { GET as getProductAiSummary } from '@/app/api/v1/products/[id]/summary/route';
import { createFeedback, resetInMemoryFeedbacks } from '@/lib/feedbacks';
import { generateProductReviewSummary, mastra, reviewSummaryAgent } from '@/lib/mastra/agent';
import { createProduct, resetInMemoryProducts } from '@/lib/products';

describe('AI Review Summary Feature with Mastra & GPT-4o-mini', () => {
  it('should verify Mastra Agent is properly configured with gpt-4o-mini', () => {
    expect(reviewSummaryAgent.name).toBe('Product Review Summary Agent');
    expect(reviewSummaryAgent.id).toBe('product-review-summary-agent');
    expect(mastra.getAgent('reviewSummaryAgent')).toBeDefined();
  });

  it('GET /api/v1/products/[id]/summary should return 404 for a non-existent product', async () => {
    const req = new Request('http://localhost:3000/api/v1/products/prod_inexistente/summary');
    const res = await getProductAiSummary(req, { params: { id: 'prod_inexistente' } });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe('Produto não encontrado.');
  });

  it('GET /api/v1/products/[id]/summary should return 200 with hasReviews: false when no feedbacks exist', async () => {
    resetInMemoryProducts();
    const newProduct = await createProduct({
      id: 'prod_empty_reviews_test',
      name: 'Novo Produto Sem Reviews',
      description: 'Um produto recém cadastrado na plataforma.',
      external_link: 'https://exemplo.com',
      score: false,
    });

    const req = new Request(`http://localhost:3000/api/v1/products/${newProduct.id}/summary`);
    const res = await getProductAiSummary(req, { params: { id: newProduct.id } });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.hasReviews).toBe(false);
    expect(data.totalReviews).toBe(0);
    expect(data.summary).toBeNull();
    expect(data.message).toContain('Ainda não há avaliações cadastradas');
  });

  it('GET /api/v1/products/[id]/summary should return 200 with structured AI summary when feedbacks exist', async () => {
    resetInMemoryProducts();
    resetInMemoryFeedbacks();

    // Cria um produto de teste
    const product = await createProduct({
      id: 'prod_ai_summary_test',
      name: 'Super Dev Tool',
      description: 'Ferramenta de produtividade para engenheiros.',
      external_link: 'https://superdev.app',
      score: true,
    });

    // Insere feedbacks para o produto
    await createFeedback({
      id: 'fb-test-1',
      score: 5,
      comment: 'Incrível! Economizou horas da minha equipe com automações impecáveis.',
      created_by: 'user-1',
      product_id: product.id,
      author: { first_name: 'Lucas', last_name: 'Silva', email: 'lucas@example.com' },
    });

    await createFeedback({
      id: 'fb-test-2',
      score: 4,
      comment: 'Muito rápido e intuitivo, mas sinto falta de documentação em português.',
      created_by: 'user-2',
      product_id: product.id,
      author: { first_name: 'Ana', last_name: 'Paula', email: 'ana@example.com' },
    });

    const req = new Request(`http://localhost:3000/api/v1/products/${product.id}/summary`);
    const res = await getProductAiSummary(req, { params: { id: product.id } });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.hasReviews).toBe(true);
    expect(data.totalReviews).toBe(2);
    expect(data.averageScore).toBe(4.5);
    expect(data.summary).toBeDefined();

    // Valida os campos da síntese gerada
    expect(typeof data.summary.summary).toBe('string');
    expect(data.summary.summary.length).toBeGreaterThan(10);
    expect(['positive', 'mixed', 'neutral', 'negative']).toContain(data.summary.sentiment);
    expect(Array.isArray(data.summary.pros)).toBe(true);
    expect(data.summary.pros.length).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(data.summary.cons)).toBe(true);
    expect(typeof data.summary.verdict).toBe('string');
  });

  it('generateProductReviewSummary should throw an error when called with empty feedbacks array', async () => {
    const product = {
      id: 'prod_empty',
      name: 'Test',
      external_link: 'https://example.com',
      score: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    expect(generateProductReviewSummary(product, [])).rejects.toThrow(
      'Não há avaliações disponíveis para gerar o resumo.',
    );
  });
});
