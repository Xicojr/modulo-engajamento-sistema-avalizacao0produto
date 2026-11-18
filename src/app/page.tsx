import { ProductGrid } from '@/components/products/product-grid';
import { Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex-1 bg-slate-50/60 dark:bg-slate-950 flex flex-col">
      {/* Hero Editorial */}
      <section className="border-b border-border/60 bg-white dark:bg-slate-900/50 py-12 md:py-16">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground mb-4 bg-slate-50 dark:bg-slate-800">
              <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Catálogo aberto ao público</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
              Produtos e ferramentas avaliados pela comunidade.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Explore lançamentos, descubra serviços confiáveis e acompanhe as opiniões autênticas
              de quem usa cada solução no dia a dia.
            </p>
          </div>
        </div>
      </section>

      {/* Vitrine de Produtos com Infinite Scroll */}
      <section className="container max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-16 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Vitrine de Produtos
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Role para baixo para carregar os itens continuamente
            </p>
          </div>
        </div>

        <ProductGrid />
      </section>

      {/* Rodapé */}
      <footer className="border-t border-border/60 bg-white dark:bg-slate-900/50 py-8 text-center text-xs text-muted-foreground">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Módulo de Engajamento. Catálogo público de produtos.</p>
          <div className="flex items-center gap-4">
            <span>Acesso público</span>
            <span>·</span>
            <span>Avaliações autênticas</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
