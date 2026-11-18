'use client';

import type { Product } from '@/lib/products';
import { ArrowRight, ExternalLink, Package, Sparkles } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = React.useState(false);
  const hasImage = Boolean(product.image_url) && !imageError;

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-card transition-all duration-150 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm">
      <div>
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-900 border-b border-border/60">
          <Link
            href={`/products/${product.id}`}
            className="block h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            tabIndex={-1}
            aria-hidden="true"
          >
            {hasImage ? (
              <img
                src={product.image_url as string}
                alt={product.name}
                loading="lazy"
                onError={() => setImageError(true)}
                className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-400">
                <Package className="h-8 w-8 stroke-[1.5]" />
              </div>
            )}
          </Link>

          {product.score && (
            <div className="absolute top-2.5 right-2.5">
              <span className="inline-flex items-center gap-1 rounded-md border border-slate-900/10 bg-white/95 px-2 py-0.5 text-[11px] font-medium text-slate-800 shadow-sm backdrop-blur-sm dark:bg-slate-900/90 dark:text-slate-200">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Destaque
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="text-base font-semibold text-foreground tracking-tight leading-snug">
            <Link
              href={`/products/${product.id}`}
              className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              {product.name}
            </Link>
          </h3>

          <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {product.description ||
              'Produto disponível para engajamento e avaliações da comunidade.'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/60 px-5 py-3.5 bg-slate-50/50 dark:bg-slate-900/30 text-xs">
        <a
          href={product.external_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          title={`Acessar link externo de ${product.name}`}
        >
          <span>Visitar site</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>

        <Link
          href={`/products/${product.id}`}
          className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          <span>Ver detalhes</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </article>
  );
}
