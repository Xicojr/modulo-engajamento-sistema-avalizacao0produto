# Plano de Implementação: Home (Listagem de Produtos)

## 1. Visão Geral e Escopo
- **Spec de Referência**: `specs/home.md`
- **Escopo**: Front-End, Back-End, Banco de Dados
- **Objetivo**: Implementar o catálogo e listagem de produtos na Home (`/`) com suporte a infinite scroll (paginação contínua), banco de dados com a tabela `products`, endpoints de API para consulta paginada e inserção manual, e cartões de produto clicáveis direcionando para a página de detalhes (`/products/[id]`).

---

## 2. Decisões de Banco de Dados e Migrations

### 2.1 Migration Supabase (`supabase/migrations/002_create_products.sql`)
- Criação da tabela `products` respeitando os campos da spec:
  ```sql
  CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    external_link TEXT NOT NULL,
    score BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
  );

  CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);
  ```
- Trigger para atualizar `updated_at` automaticamente.

### 2.2 Camada de Dados (`src/lib/products.ts`)
- Interface TypeScript `Product`:
  ```ts
  export interface Product {
    id: string;
    name: string;
    description?: string | null;
    image_url?: string | null;
    external_link: string;
    score: boolean;
    created_at: string;
    updated_at: string;
  }
  ```
- Suporte a Supabase e fallback em memória com dados iniciais de demonstração (seed) para execução de testes locais e ambiente de desenvolvimento quando as chaves de banco não estiverem preenchidas.
- Métodos exportados:
  - `listProducts({ page, limit }): Promise<{ products: Product[]; nextCursor: number | null; total: number }>`
  - `findProductById(id: string): Promise<Product | null>`
  - `createProduct(data: Omit<Product, 'created_at' | 'updated_at'>): Promise<Product>`

---

## 3. Endpoints de API

### 3.1 `GET /api/v1/products`
- **Parâmetros de Query**:
  - `page`: número da página (padrão: 1).
  - `limit`: quantidade por página (padrão: 6 ou 9 para grade harmoniosa).
- **Resposta**:
  - `200 OK` contendo a lista de produtos (ou array vazio `[]` caso não existam), com metadados para infinite loading:
    ```json
    {
      "products": [ ... ],
      "nextCursor": 2,
      "total": 12
    }
    ```

### 3.2 `POST /api/v1/products`
- **Corpo da Requisição**:
  ```json
  {
    "name": "Design Studio Pro",
    "description": "Ferramenta colaborativa de prototipagem rápida.",
    "image_url": "https://images.unsplash.com/photo-...",
    "external_link": "https://designstudio.example.com",
    "score": true
  }
  ```
- **Validação com Zod** (`src/lib/validations/product.ts`):
  - `name`: obrigatório, mín. 2 caracteres.
  - `external_link`: URL válida.
  - `description`: opcional.
  - `image_url`: opcional (com placeholder visual caso ausente).
  - `score`: booleano opcional (padrão `false`).
- Gera o identificador único via `nanoid()` na camada da API.
- Salva no banco de dados e retorna `201 Created` com o produto persistido.

---

## 4. Interface e Experiência do Usuário (UI/UX)

### 4.1 Estrutura da Página Principal (`src/app/page.tsx`)
- **Hero & Apresentação**:
  - Cabeçalho editorial moderno explicando a proposta da plataforma (módulo de engajamento e avaliações autênticas).
  - Seguindo as diretrizes de design da skill `frontend-design` (evitando clichês genéricos de IA, com tipografia intencional e hierarquia clara).
- **Catálogo de Produtos com Infinite Scroll**:
  - Integração com `@tanstack/react-query` via hook `useInfiniteQuery`.
  - Grid responsivo (1 coluna no mobile, 2 colunas no tablet, 3 colunas em telas amplas).
  - Observer de intersecção (`IntersectionObserver`) ou elemento sentinela no rodapé para disparar automaticamente o carregamento da próxima página ao rolar.
  - Skeletons animados durante a busca de novas páginas.
  - Indicador elegante de término de catálogo ("Você visualizou todos os produtos").
  - Estado vazio estilizado caso a plataforma ainda não possua itens.

### 4.2 Componente do Card de Produto (`src/components/products/product-card.tsx`)
- Exibição de:
  - Imagem de capa com proporção consistente (aspect ratio) e fallback suave para falha de carregamento.
  - Título/nome do produto como link navegando para a página de detalhes: `/products/[id]`.
  - Descrição resumida em texto legível.
  - Link externo com ícone `ExternalLink` abrindo em nova guia de forma segura (`rel="noopener noreferrer"`).
  - Badge sutil indicando produto avaliado/destaque.

---

## 5. Arquivos a Criar ou Modificar
- `supabase/migrations/002_create_products.sql` *(Novo)*: Migration da tabela `products`.
- `src/lib/products.ts` *(Novo)*: Camada de acesso a dados e fallback in-memory com seed de produtos.
- `src/lib/validations/product.ts` *(Novo)*: Schemas Zod de validação para produtos.
- `src/app/api/v1/products/route.ts` *(Novo)*: Handlers GET (listagem paginada) e POST (criação).
- `src/components/products/product-card.tsx` *(Novo)*: Card visual do produto.
- `src/components/products/product-grid.tsx` *(Novo)*: Grid com infinite scroll via TanStack Query.
- `src/app/page.tsx` *(Modificação)*: Substituição da home estática pela vitrine interativa com infinite scrolling.
- `tests/home.test.ts` *(Novo)*: Testes automatizados cobrindo GET paginado, POST de novos produtos e validações.

---

## 6. Critérios de Teste e Validação
1. **Listagem Paginada**: `GET /api/v1/products?page=1&limit=2` retorna 2 produtos e indica `nextCursor = 2`.
2. **Criação de Produto**: `POST /api/v1/products` com payload válido gera nanoid, persiste o produto e retorna status `201`.
3. **Validação de Erros**: `POST` sem campos obrigatórios (`name`, `external_link`) retorna status `400`.
4. **Navegação UI**: Clicar no título de qualquer card direciona para `/products/[id]`.
5. **Infinite Scroll**: Rolar até a parte inferior da lista carrega os próximos produtos continuamente.
6. **Suíte Automatizada**: `bun test tests/home.test.ts` e `bun run lint` executam com sucesso.
