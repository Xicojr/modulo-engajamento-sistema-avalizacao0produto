'use client';

import { Button } from '@/components/ui/button';
import type { ReviewSummary } from '@/lib/mastra/agent';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Bot, CheckCircle2, Info, RefreshCw, Sparkles, ThumbsUp } from 'lucide-react';
import * as React from 'react';

interface AiSummaryResponse {
  productId: string;
  productName: string;
  totalReviews: number;
  averageScore: number;
  hasReviews: boolean;
  summary: ReviewSummary | null;
  isFallback?: boolean;
  model?: string;
  provider?: string;
  notice?: string;
  message?: string;
  generatedAt?: string;
}

interface AiSummaryCardProps {
  productId: string;
  productName: string;
}

export function AiSummaryCard({ productId, productName }: AiSummaryCardProps) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<AiSummaryResponse>({
    queryKey: ['product-ai-summary', productId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/products/${productId}/summary`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Não foi possível carregar o resumo da IA.');
      }
      return (await res.json()) as AiSummaryResponse;
    },
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 5, // 5 minutos de cache padrão
  });

  // Estado de carregamento inicial
  if (isLoading) {
    return (
      <section
        aria-label="Resumo gerado por inteligência artificial"
        className="rounded-2xl border border-indigo-100 dark:border-indigo-950/60 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30 dark:from-zinc-900/90 dark:via-zinc-900 dark:to-indigo-950/20 p-6 sm:p-8 shadow-sm space-y-5 animate-pulse"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center">
              <Bot className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="space-y-1.5">
              <div className="h-4 w-36 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-3 w-48 bg-zinc-100 dark:bg-zinc-800/60 rounded" />
            </div>
          </div>
          <div className="h-7 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="h-24 rounded-xl bg-zinc-100 dark:bg-zinc-800/50" />
          <div className="h-24 rounded-xl bg-zinc-100 dark:bg-zinc-800/50" />
        </div>
      </section>
    );
  }

  // Tratamento de erro na requisição
  if (isError) {
    return (
      <section
        aria-label="Erro ao carregar resumo da IA"
        className="rounded-2xl border border-rose-200 dark:border-rose-950/60 bg-rose-50/50 dark:bg-rose-950/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-rose-900 dark:text-rose-200">
              Não foi possível gerar a síntese por IA
            </h3>
            <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
              {error instanceof Error ? error.message : 'Ocorreu uma instabilidade momentânea.'}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-800 dark:text-rose-200 gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Tentar novamente
        </Button>
      </section>
    );
  }

  // Estado quando ainda NÃO há avaliações cadastradas
  if (!data?.hasReviews || !data?.summary) {
    return (
      <section
        aria-label="Resumo por IA sem avaliações"
        className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 p-6 sm:p-8 text-center space-y-3"
      >
        <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
          <Bot className="w-5 h-5" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            Síntese inteligente com IA
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 pt-1">
            Aguardando primeiras avaliações da comunidade
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Assim que os membros da comunidade avaliarem o{' '}
            <strong className="font-semibold text-zinc-700 dark:text-zinc-300">
              {productName}
            </strong>
            , nosso agente analisará todos os comentários via{' '}
            <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-1.5 py-0.5 rounded">
              Mastra + GPT-4o-mini
            </span>{' '}
            para gerar um resumo consolidado de sentimentos e pontos fortes.
          </p>
        </div>
      </section>
    );
  }

  const { summary, totalReviews, averageScore, isFallback, notice } = data;

  // Mapeamento de estilos visuais para os sentimentos
  const sentimentConfig = {
    positive: {
      label: 'Sentimento Muito Positivo',
      badgeClass:
        'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
      dotClass: 'bg-emerald-500',
    },
    mixed: {
      label: 'Sentimento Misto / Equilibrado',
      badgeClass:
        'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
      dotClass: 'bg-amber-500',
    },
    neutral: {
      label: 'Sentimento Neutro',
      badgeClass:
        'bg-slate-50 text-slate-800 border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800',
      dotClass: 'bg-slate-400',
    },
    negative: {
      label: 'Sentimento Crítico',
      badgeClass:
        'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
      dotClass: 'bg-rose-500',
    },
  };

  const currentSentiment = sentimentConfig[summary.sentiment] || sentimentConfig.positive;

  return (
    <section
      aria-label="Resumo consolidado gerado por inteligência artificial"
      className="relative overflow-hidden rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/20 dark:from-zinc-900 dark:via-zinc-900/95 dark:to-indigo-950/30 p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(79,70,229,0.08)] space-y-6"
    >
      {/* Topo do Card: Identificação clara de IA + Ferramenta Mastra + Sentimento */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-100 dark:border-indigo-950/60">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Resumo da IA
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-100/70 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-[11px] font-mono font-medium text-indigo-800 dark:text-indigo-300">
              <Bot className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              Mastra + GPT-4o-mini
            </span>

            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {totalReviews} {totalReviews === 1 ? 'avaliação analisada' : 'avaliações analisadas'}{' '}
              ({averageScore.toFixed(1)} ★)
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 pt-1">
            O que a comunidade diz sobre este produto
          </h2>
        </div>

        {/* Status de Sentimento e Botão de Atualização */}
        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${currentSentiment.badgeClass}`}
          >
            <span className={`w-2 h-2 rounded-full ${currentSentiment.dotClass}`} />
            <span>{currentSentiment.label}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Atualizar análise inteligente das avaliações"
            className="h-8 px-2.5 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 gap-1 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
        </div>
      </div>

      {/* Parágrafo de Síntese Geral */}
      <div className="space-y-1">
        <p className="text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
          {summary.summary}
        </p>
      </div>

      {/* Grid com Pontos Fortes e Pontos de Atenção */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Coluna: Pontos Fortes */}
        <div className="rounded-xl border border-emerald-100 dark:border-emerald-950/60 bg-emerald-50/40 dark:bg-emerald-950/15 p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
            <ThumbsUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider">
              Pontos Fortes mais elogiados
            </h3>
          </div>
          <ul className="space-y-2">
            {summary.pros.map((pro) => (
              <li
                key={pro}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-snug"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Coluna: Pontos de Atenção / Melhorias */}
        <div className="rounded-xl border border-amber-100 dark:border-amber-950/60 bg-amber-50/40 dark:bg-amber-950/15 p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider">
              Pontos de Atenção & Sugestões
            </h3>
          </div>
          <ul className="space-y-2">
            {summary.cons.map((con) => (
              <li
                key={con}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-snug"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Veredito da Comunidade */}
      {summary.verdict && (
        <div className="rounded-xl border border-indigo-100 dark:border-indigo-950/60 bg-white/80 dark:bg-zinc-900/60 p-4 sm:p-5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
              Veredito da comunidade
            </span>
            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
              {summary.verdict}
            </p>
          </div>
        </div>
      )}

      {/* Aviso amigável caso esteja em modo demonstração / fallback */}
      {isFallback && notice && (
        <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
          <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>{notice}</span>
        </div>
      )}
    </section>
  );
}
