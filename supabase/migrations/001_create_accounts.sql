-- Migration: Create accounts table
-- Description: Armazena os usuários cadastrados na plataforma com segurança via salt + bcrypt

CREATE TABLE IF NOT EXISTS public.accounts (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index para buscas rápidas por e-mail (login e verificação de duplicidade)
CREATE INDEX IF NOT EXISTS idx_accounts_email ON public.accounts (email);

-- Trigger para atualização automática da coluna updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_accounts_updated_at ON public.accounts;

CREATE TRIGGER trigger_accounts_updated_at
BEFORE UPDATE ON public.accounts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
