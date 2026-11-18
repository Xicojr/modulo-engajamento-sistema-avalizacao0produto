# Plano de Implementação: Feedback (Avaliações de Produtos)

## 1. Visão Geral e Escopo
- **Spec de Referência**: `specs/feedback.md`
- **Escopo**: Front-End, Back-End, Banco de Dados
- **Objetivo**: Implementar o sistema completo de avaliações e comentários para produtos, construindo a página de detalhes do produto (`/products/[id]`), a tabela e migration `products_feedbacks`, endpoints de API protegidos por autenticação e formulário interativo de avaliação (notas 1 a 5 com estrelas e texto de comentário), bloqueando submissões de usuários não autenticados com um aviso visual.

---

## 2. Decisões de Banco de Dados e Migrations

### 2.1 Migration Supabase (`supabase/migrations/003_create_products_feedbacks.sql`)
- Estrutura da tabela conforme especificação:
  ```sql
  CREATE TABLE IF NOT EXISTS public.products_feedbacks (
    id TEXT PRIMARY KEY,
    score INT NOT NULL CHECK (score >= 1 AND score <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_by TEXT NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_feedbacks_product_id ON public.products_feedbacks (product_id);
  CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON public.products_feedbacks (created_at DESC);
  ```

### 2.2 Camada de Dados (`src/lib/feedbacks.ts`)
- Interface TypeScript `ProductFeedback`:
  ```ts
  export interface ProductFeedback {
    id: string;
    score: number;
    comment: string;
    created_at: string;
    created_by: string;
    product_id: string;
    author?: {
      first_name: string;
      last_name: string;
      email: string;
    };
  }
  ```
- Suporte a Supabase com joins em `accounts` e fallback em memória com dados simulados para desenvolvimento e testes automatizados sem dependência externa.
- Métodos exportados:
  - `listFeedbacksByProductId(productId: string): Promise<ProductFeedback[]>`
  - `createFeedback(data: Omit<ProductFeedback, 'created_at'>): Promise<ProductFeedback>`
  - `getFeedbackStats(productId: string): Promise<{ averageScore: number; totalCount: number }>`

---

## 3. Endpoints de API

### 3.1 `GET /api/v1/products/[id]`
- Retorna os dados completos do produto pelo identificador.
- Retorna `200 OK` com o produto ou `404 Not Found` caso não exista.

### 3.2 `GET /api/v1/products/[id]/feedbacks`
- Retorna a lista de comentários e avaliações já registradas para o produto específico, ordenadas cronologicamente do mais recente ao mais antigo.
- Retorna métricas resumidas (`averageScore`, `totalFeedbacks`).
- Retorna `200 OK` mesmo se a lista for vazia (`[]`).

### 3.3 `POST /api/v1/products/[id]/feedbacks`
- **Autenticação Obrigatória**:
  - Inspeciona o cookie de sessão via `getSessionUser(request)` definido pelo contrato de `src/lib/session.ts`.
  - Caso o usuário não esteja logado:
    - Retorna status `401 Unauthorized`:
      ```json
      { "error": "Você precisa estar autenticado para enviar uma avaliação." }
      ```
- **Validação de Entrada com Zod** (`src/lib/validations/feedback.ts`):
  - `score`: número inteiro entre 1 e 5.
  - `comment`: texto com no mínimo 3 caracteres e no máximo 1000 caracteres.
  - Se inválido, retorna status `400 Bad Request`.
- **Persistência**:
  - Gera `id` único com `nanoid()`.
  - Associa `created_by` com o `id` do usuário da sessão e `product_id` da rota.
  - Retorna status `201 Created` com o feedback recém-cadastrado.

---

## 4. Interface e Experiência do Usuário (UI/UX)

### 4.1 Página de Detalhes (`src/app/products/[id]/page.tsx`)
- **Seção de Cabeçalho do Produto**:
  - Botão de retorno para o catálogo ("Voltar aos produtos").
  - Nome, imagem em destaque, descrição e link externo oficial.
  - Resumo de avaliação com média de estrelas (ex: ★ 4.7 de 5 estrelas) e total de avaliações recebidas.
- **Seção de Lista de Avaliações**:
  - Listagem dos comentários existentes com:
    - Indicador visual de 1 a 5 estrelas (`src/components/feedback/star-rating.tsx`).
    - Nome do autor (com avatar gerado via DiceBear).
    - Data formatada relativa (ex: "há 2 dias" ou "14 de nov de 2026").
    - Texto completo do comentário.
  - Estado vazio amigável caso não haja feedbacks ("Ainda não há avaliações para este produto. Seja o primeiro a compartilhar sua experiência!").
- **Seção de Envio de Avaliação (Gating de Autenticação)**:
  - **Cenário Não Autenticado (Visitante)**:
    - Exibe um card visual de destaque informando a necessidade de login.
    - Mensagem clara: "Faça login para avaliar este produto".
    - Botão direto direcionando para `/auth/sign-in?redirect=/products/${id}`.
  - **Cenário Autenticado**:
    - Renderiza o formulário interativo de avaliação (`src/components/feedback/feedback-form.tsx`).
    - Componente interativo de seleção de estrelas (1 a 5) com feedback dinâmico ao passar o mouse.
    - Campo de texto para o comentário com contador de caracteres.
    - Botão "Publicar avaliação" com spinner de loading e desativação durante a requisição.
    - Invalidação da query do TanStack Query para atualização instantânea da listagem após o envio bem-sucedido.

---

## 5. Arquivos a Criar ou Modificar
- `supabase/migrations/003_create_products_feedbacks.sql` *(Novo)*: Migration da tabela `products_feedbacks`.
- `src/lib/feedbacks.ts` *(Novo)*: Camada de dados para avaliações e fallback em memória com dados mock.
- `src/lib/validations/feedback.ts` *(Novo)*: Schemas Zod de validação de feedback.
- `src/app/api/v1/products/[id]/route.ts` *(Novo)*: Endpoint para obter os dados do produto por ID.
- `src/app/api/v1/products/[id]/feedbacks/route.ts` *(Novo)*: Endpoints GET (listar) e POST (criar avaliação autenticada).
- `src/components/feedback/star-rating.tsx` *(Novo)*: Componente reutilizável de estrelas (modo leitura e modo formulário interativo).
- `src/components/feedback/feedback-form.tsx` *(Novo)*: Formulário com validação e submissão via React Query.
- `src/components/feedback/feedback-list.tsx` *(Novo)*: Listagem dos comentários e autores.
- `src/app/products/[id]/page.tsx` *(Novo)*: Página de detalhes do produto integrando todos os blocos.
- `tests/feedback.test.ts` *(Novo)*: Testes automatizados cobrindo listagem pública, bloqueio sem auth (401), submissão com cookie válido (201) e validações de nota/comentário (400).

---

## 6. Critérios de Teste e Validação
1. **Visualização Pública**: Visitantes não autenticados conseguem acessar `/products/[id]`, visualizar dados do produto e avaliações já existentes.
2. **Bloqueio de Visitantes**: Tentativa de POST em `/api/v1/products/[id]/feedbacks` sem cookie de sessão retorna `401 Unauthorized`, e na UI o formulário é substituído pelo bloco de login.
3. **Criação com Sucesso**: Usuário autenticado enviando nota de 1 a 5 e comentário válido recebe status `201`, e a nova avaliação aparece imediatamente na lista.
4. **Validações de Campo**: Nota menor que 1 ou maior que 5, ou comentário vazio, retornam status `400`.
5. **Suíte Automatizada**: `bun test tests/feedback.test.ts` e `bun run lint` executam com sucesso.
