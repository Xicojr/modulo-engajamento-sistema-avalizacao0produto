'use client';

import { ProductCard } from '@/components/products/product-card';
import { Button } from '@/components/ui/button';
import type { ListProductsResult } from '@/lib/products';
import { useInfiniteQuery } from '@tanstack/react-query';
import { AlertCircle, Check, Loader2, PackageOpen, RefreshCw } from 'lucide-react';
import * as React from 'react';

async function fetchProductsApi(page: number): Promise<ListProductsResult> {
  const response = await fetch(`/api/v1/products?page=${page}&limit=6`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Não foi possível carregar os produtos.');
  }
  return response.json();
}

function ProductCardSkeleton() {
  return (
    <div
      className="flex flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card animate-pulse"
      aria-hidden="true"
    >
      <div>
        <div className="aspect-[16/10] w-full bg-slate-200 dark:bg-slate-800" />
        <div className="p-5 space-y-3">
          <div className="h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2">
            <div className="h-3.5 w-full rounded bg-slate-100 dark:bg-slate-800/80" />
            <div className="h-3.5 w-4/5 rounded bg-slate-100 dark:bg-slate-800/80" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border/60 px-5 py-3.5 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="h-3.5 w-20 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3.5 w-20 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export function ProductGrid() {
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['products'],
    queryFn: ({ pageParam }) => fetchProductsApi(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const products = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.products) ?? [];
  }, [data]);

  const totalCount = data?.pages[0]?.total ?? 0;

  // IntersectionObserver para infinite scrolling contínuo
  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '250px',
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Estado Inicial de Carregamento
  if (status === 'pending') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton index is safe here
            <ProductCardSkeleton key={`initial-skeleton-${index}`} />
          ))}
        </div>
      </div>
    );
  }

  // Estado de Erro
  if (status === 'error') {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-6 text-center dark:border-rose-900/50 dark:bg-rose-950/20">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/30">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-base font-semibold text-rose-900 dark:text-rose-200">
          Erro ao carregar catálogo
        </h3>
        <p className="mt-1 text-sm text-rose-700 dark:text-rose-300 max-w-md mx-auto">
          {error instanceof Error ? error.message : 'Ocorreu uma falha na consulta aos produtos.'}
        </p>
        <Button
          onClick={() => refetch()}
          variant="outline"
          disabled={isRefetching}
          className="mt-4 gap-2 bg-white hover:bg-slate-50 dark:bg-slate-900"
        >
          <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          Tentar novamente
        </Button>
      </div>
    );
  }

  // Catálogo Vazio
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800">
          <PackageOpen className="h-7 w-7 stroke-[1.5]" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">Nenhum produto cadastrado</h3>
        <p className="mt-1.5 text-sm text-muted-foreground max-w-sm mx-auto">
          Ainda não há produtos disponíveis no catálogo de avaliações. Novos lançamentos serão
          adicionados em breve.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Grid de produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}

        {/* Skeletons adicionais ao carregar próxima página */}
        {isFetchingNextPage &&
          Array.from({ length: 3 }).map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton index is safe here
            <ProductCardSkeleton key={`next-skeleton-${index}`} />
          ))}
      </div>

      {/* Sentinela de IntersectionObserver */}
      <div ref={sentinelRef} className="h-4 w-full" aria-hidden="true" />

      {/* Indicador de carregamento ou fim de catálogo */}
      <div className="pt-2 pb-6 text-center">
        {isFetchingNextPage && (
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            <span>Carregando mais produtos...</span>
          </div>
        )}

        {!hasNextPage && products.length > 0 && (
          <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            <span>
              Você visualizou todos os {totalCount > 0 ? totalCount : products.length} produtos
              disponíveis no catálogo.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
