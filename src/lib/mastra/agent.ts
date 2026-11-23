import type { ProductFeedback } from '@/lib/feedbacks';
import type { Product } from '@/lib/products';
import { Mastra } from '@mastra/core';
import { Agent } from '@mastra/core/agent';
import { z } from 'zod';

/**
 * Esquema tipado para a síntese estruturada de avaliações gerada pelo agente Mastra
 */
export const reviewSummarySchema = z.object({
  summary: z
    .string()
    .describe('Resumo geral da percepção dos usuários sobre o produto em 2 a 3 frases claras.'),
  sentiment: z
    .enum(['positive', 'mixed', 'neutral', 'negative'])
    .describe('Sentimento geral predominante dos usuários.'),
  pros: z
    .array(z.string())
    .describe('2 a 4 principais pontos positivos e qualidades elogiadas pelos usuários.'),
  cons: z
    .array(z.string())
    .describe('1 a 3 ressalvas, pontos de atenção ou sugestões de melhoria identificadas.'),
  verdict: z
    .string()
    .describe('Veredito final objetivo sobre para quem este produto é mais recomendado.'),
});

export type ReviewSummary = z.infer<typeof reviewSummarySchema>;

/**
 * Agente Mastra configurado com GPT-4o-mini para sintetizar feedbacks de produtos
 * Exemplo e documentação Mastra: https://mastra.ai/docs/agents/overview
 */
export const reviewSummaryAgent = new Agent({
  id: 'product-review-summary-agent',
  name: 'Product Review Summary Agent',
  instructions: `
Você é um especialista sênior em inteligência de produto e síntese de avaliações de usuários.
Sua missão é analisar cuidadosamente todos os comentários e notas deixados pela comunidade para um produto e gerar um resumo consolidado, imparcial e de alto valor prático.

Diretrizes obrigatórias:
1. Síntese Geral (summary): Explique o sentimento predominante da comunidade e a percepção geral sobre o produto em linguagem natural, clara e profissional.
2. Sentimento (sentiment):
   - 'positive': quando as avaliações são amplamente elogiosas (médias 4.0 - 5.0).
   - 'mixed': quando há divergências perceptíveis ou pontos positivos e negativos em equilíbrio.
   - 'neutral': quando as opiniões são neutras ou sem forte entusiasmo.
   - 'negative': quando as críticas superam os elogios (médias inferiores a 3.0).
3. Pontos Positivos (pros): Liste de 2 a 4 itens objetivos detalhando o que os usuários mais valorizaram.
4. Pontos de Atenção (cons): Liste de 1 a 3 ressalvas, bugs, limitações ou melhorias solicitadas.
5. Veredito (verdict): Um fechamento objetivo recomendando o produto para o seu público-alvo ideal.

Mantenha a escrita fluida em Português do Brasil, sem floreios desnecessários.
`,
  model: 'openai/gpt-4o-mini',
});

/**
 * Instância Mastra registrando o agente de síntese
 */
export const mastra = new Mastra({
  agents: { reviewSummaryAgent },
});

export interface SummaryGenerationResult {
  summary: ReviewSummary;
  isFallback: boolean;
  model: string;
  provider: string;
  notice?: string;
}

/**
 * Função geradora do resumo de avaliações utilizando o agente Mastra ou fallback inteligente
 */
export async function generateProductReviewSummary(
  product: Product,
  feedbacks: ProductFeedback[],
): Promise<SummaryGenerationResult> {
  if (feedbacks.length === 0) {
    throw new Error('Não há avaliações disponíveis para gerar o resumo.');
  }

  const averageScore = feedbacks.reduce((acc, curr) => acc + curr.score, 0) / feedbacks.length;

  const prompt = `
Produto: "${product.name}"
Descrição do produto: "${product.description || 'Sem descrição cadastrada'}"
Total de avaliações recebidas: ${feedbacks.length}
Nota média calculada: ${averageScore.toFixed(1)} de 5.0 estrelas

Abaixo estão todos os comentários e notas enviados pelos usuários:
${feedbacks
  .map(
    (fb, idx) =>
      `${idx + 1}. [Nota: ${fb.score}/5] "${fb.comment}" — por ${
        fb.author ? `${fb.author.first_name} ${fb.author.last_name}` : 'Membro da comunidade'
      }`,
  )
  .join('\n')}

Com base estritamente nas avaliações acima, produza a síntese estruturada do produto conforme o schema.
`.trim();

  // Se houver chave da OpenAI configurada no ambiente, executa via Mastra Agent + GPT-4o-mini
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await reviewSummaryAgent.generate(prompt, {
        structuredOutput: {
          schema: reviewSummarySchema,
        },
      });

      if (response?.object) {
        return {
          summary: response.object,
          isFallback: false,
          model: 'gpt-4o-mini',
          provider: 'Mastra + OpenAI',
        };
      }

      if (response?.text) {
        try {
          const parsed = JSON.parse(response.text);
          const validated = reviewSummarySchema.safeParse(parsed);
          if (validated.success) {
            return {
              summary: validated.data,
              isFallback: false,
              model: 'gpt-4o-mini',
              provider: 'Mastra + OpenAI',
            };
          }
        } catch {
          // segue para fallback estruturado caso o parsing de texto falhe
        }
      }
    } catch (agentError) {
      console.warn(
        '[Mastra Agent] Falha ao comunicar com OpenAI GPT-4o-mini, ativando fallback local:',
        agentError instanceof Error ? agentError.message : agentError,
      );
    }
  }

  // Fallback analítico inteligente baseado nos dados reais (usado quando OPENAI_API_KEY não foi configurada ou em testes)
  const sentiment: 'positive' | 'mixed' | 'neutral' | 'negative' =
    averageScore >= 4.0
      ? 'positive'
      : averageScore >= 3.0
        ? 'mixed'
        : averageScore >= 2.0
          ? 'neutral'
          : 'negative';

  const positiveComments = feedbacks.filter((fb) => fb.score >= 4).map((fb) => fb.comment);
  const criticalComments = feedbacks.filter((fb) => fb.score <= 3).map((fb) => fb.comment);

  const pros: string[] = [];
  if (positiveComments.length > 0) {
    pros.push(
      ...positiveComments
        .slice(0, 3)
        .map((comment) => (comment.length > 90 ? `${comment.slice(0, 87)}...` : comment)),
    );
  } else {
    pros.push(`Avaliações iniciais destacam recursos funcionais do ${product.name}`);
  }

  const cons: string[] = [];
  if (criticalComments.length > 0) {
    cons.push(
      ...criticalComments
        .slice(0, 2)
        .map((comment) => (comment.length > 90 ? `${comment.slice(0, 87)}...` : comment)),
    );
  } else {
    cons.push('Nenhum ponto negativo crítico foi recorrente nas opiniões avaliadas.');
  }

  const summary = `Com base em ${feedbacks.length} ${
    feedbacks.length === 1 ? 'avaliação' : 'avaliações'
  } da comunidade, ${product.name} obteve média de ${averageScore.toFixed(1)} estrelas. A percepção geral é ${
    sentiment === 'positive'
      ? 'bastante favorável, com destaque para a usabilidade e eficácia no fluxo de trabalho.'
      : sentiment === 'mixed'
        ? 'positiva no geral, mas com considerações e sugestões de evolução registradas pelos usuários.'
        : 'com ressalvas importantes que demandam atenção por parte da equipe.'
  }`;

  const verdict =
    sentiment === 'positive'
      ? `Recomendado para usuários e equipes que valorizam confiabilidade e eficiência com ${product.name}.`
      : 'Uma opção a ser avaliada com base nas necessidades específicas do seu fluxo.';

  return {
    summary: {
      summary,
      sentiment,
      pros,
      cons,
      verdict,
    },
    isFallback: true,
    model: 'gpt-4o-mini',
    provider: 'Mastra (Modo Demonstração)',
    notice: !process.env.OPENAI_API_KEY
      ? 'Chave OPENAI_API_KEY não encontrada em .env.local. Adicione sua chave da OpenAI para acionar o agente GPT-4o-mini em tempo real.'
      : 'Resposta gerada por fallback analítico de contingência.',
  };
}
