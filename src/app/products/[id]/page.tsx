'use client';

import { FeedbackForm } from '@/components/feedback/feedback-form';
import { FeedbackList } from '@/components/feedback/feedback-list';
import { StarRating } from '@/components/feedback/star-rating';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import type { ProductFeedback } from '@/lib/feedbacks';
import type { Product } from '@/lib/products';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, Lock, Package, ShieldCheck, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import * as React from 'react';

export default function ProductDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const productId = Array.isArray(rawId) ? rawId[0] : (rawId as string) || '';

  const { user, isLoading: isLoadingAuth } = useAuth();
  const [imageError, setImageError] = React.useState(false);

  // Consulta dos dados do produto
  const {
    data: productData,
    isLoading: isLoadingProduct,
    isError: isProductError,
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/products/${productId}`);
      if (!res.ok) {
        throw new Error('Produto não encontrado');
      }
      return (await res.json()) as { product: Product };
    },
    enabled: Boolean(productId),
  });

  // Consulta das avaliações e estatísticas do produto
  const { data: feedbackData, isLoading: isLoadingFeedbacks } = useQuery({
    queryKey: ['product-feedbacks', productId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/products/${productId}/feedbacks`);
      if (!res.ok) {
        throw new Error('Erro ao carregar avaliações');
      }
      return (await res.json()) as {
        feedbacks: ProductFeedback[];
        averageScore: number;
        totalCount: number;
      };
    },
    enabled: Boolean(productId),
  });

  const product = productData?.product;
  const feedbacks = feedbackData?.feedbacks || [];
  const averageScore = feedbackData?.averageScore ?? 0;
  const totalCount = feedbackData?.totalCount ?? 0;

  if (isLoadingProduct) {
    return (
      <main className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
          <div className="h-5 w-36 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="md:col-span-5 aspect-[4/3] rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="md:col-span-7 space-y-4">
              <div className="h-8 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-4 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-20 w-full bg-zinc-100 dark:bg-zinc-800/60 rounded" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (isProductError || !product) {
    return (
      <main className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center space-y-5 p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Produto não encontrado
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              O produto que você está procurando não existe ou foi removido do catálogo.
            </p>
          </div>
          <Link href="/">
            <Button variant="default" className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao catálogo
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const hasImage = Boolean(product.image_url) && !imageError;

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Navegação superior de retorno */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar aos produtos
          </Link>
        </div>

        {/* Card em destaque com informações do produto */}
        <section className="overflow-hidden rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-8 lg:p-10">
            {/* Imagem do Produto */}
            <div className="md:col-span-5">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center">
                {hasImage ? (
                  <img
                    src={product.image_url as string}
                    alt={product.name}
                    onError={() => setImageError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-400">
                    <Package className="w-12 h-12 stroke-[1.5]" />
                    <span className="text-xs mt-2">Sem imagem disponível</span>
                  </div>
                )}

                {product.score && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 rounded-md border border-zinc-900/10 bg-white/95 dark:bg-zinc-900/90 px-2.5 py-1 text-xs font-medium text-zinc-800 dark:text-zinc-200 shadow-sm backdrop-blur-sm">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Destaque
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Informações editoriais */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {product.name}
                </h1>

                {/* Resumo de Avaliações */}
                <div className="flex items-center gap-3">
                  <StarRating score={Math.round(averageScore)} size="md" />
                  <div className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {totalCount > 0 ? averageScore.toFixed(1) : 'Sem notas'}
                    </span>
                    <span>•</span>
                    <span>
                      {totalCount === 0
                        ? 'Nenhuma avaliação'
                        : totalCount === 1
                          ? '1 avaliação'
                          : `${totalCount} avaliações`}
                    </span>
                  </div>
                </div>

                {/* Descrição */}
                <p className="text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {product.description ||
                    'Produto disponível para engajamento e avaliações da comunidade.'}
                </p>
              </div>

              {/* Botão de Link Externo Oficial */}
              <div className="pt-2">
                <a
                  href={product.external_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Button variant="outline" className="gap-2 font-medium">
                    <span>Visitar site oficial</span>
                    <ExternalLink className="w-4 h-4 text-zinc-500" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Seção de Avaliações Existentes */}
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Avaliações da comunidade
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Experiências e opiniões compartilhadas por usuários verificados.
              </p>
            </div>
            {totalCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 text-amber-900 dark:text-amber-300 text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{averageScore.toFixed(1)} média geral</span>
              </div>
            )}
          </div>

          <FeedbackList feedbacks={feedbacks} isLoading={isLoadingFeedbacks} />
        </section>

        {/* Seção de Envio de Nova Avaliação (Gating de Autenticação) */}
        <section className="pt-4">
          {isLoadingAuth ? (
            <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-pulse space-y-4">
              <div className="h-5 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-10 w-full bg-zinc-100 dark:bg-zinc-800/60 rounded" />
            </div>
          ) : user ? (
            /* Usuário AUTENTICADO: Renderiza o formulário */
            <FeedbackForm productId={productId} />
          ) : (
            /* Usuário NÃO AUTENTICADO: Renderiza bloco de exigência de autenticação */
            <div className="p-8 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/40 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Faça login para avaliar este produto
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                  Apenas usuários cadastrados e conectados podem registrar notas e comentários. Sua
                  avaliação ajuda a comunidade a descobrir as melhores ferramentas.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href={`/auth/sign-in?redirect=/products/${productId}`}>
                  <Button className="w-full sm:w-auto px-6 font-medium">Entrar para avaliar</Button>
                </Link>
                <Link href={`/auth/sign-up?redirect=/products/${productId}`}>
                  <Button variant="outline" className="w-full sm:w-auto px-6 font-medium">
                    Criar nova conta
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
