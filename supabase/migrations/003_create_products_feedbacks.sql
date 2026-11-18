-- Migration: Create products_feedbacks table
-- Description: Armazena as avaliações (notas de 1 a 5 e comentários) associadas a produtos e autores

CREATE TABLE IF NOT EXISTS public.products_feedbacks (
  id TEXT PRIMARY KEY,
  score INT NOT NULL CHECK (score >= 1 AND score <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by TEXT NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE
);

-- Índices para otimização de consultas por produto e ordenação cronológica
CREATE INDEX IF NOT EXISTS idx_feedbacks_product_id ON public.products_feedbacks (product_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON public.products_feedbacks (created_at DESC);
