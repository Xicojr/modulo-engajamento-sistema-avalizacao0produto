# Módulo de Engajamento & Sistema de Avaliação de Produtos

Projeto desenvolvido no **Módulo 0 (Iniciação e Alinhamento Técnico)** da **Pós-Graduação em Engenharia de IA** pela **Coders University**. 

A proposta central do projeto é a construção de uma aplicação Web completa e resiliente para **engajamento, catálogo e avaliação de produtos com síntese inteligente por Inteligência Artificial**. O sistema foi concebido e implementado em regime de *Pair Programming* com agentes autônomos de IA. Embora a ementa do curso sugerisse originalmente o uso do *Claude*, o projeto foi planejado, arquitetado e implementado integralmente utilizando o **Google Antigravity (`agy`)**, orientado por especificações técnicas formais (`specs/`) e planos estruturados (`plans/`), comprovando a robustez dos fluxos modernos de engenharia de software assistida por agentes.

---

## 🎯 Sobre o Projeto

O sistema é uma plataforma full stack moderna que permite a usuários explorar catálogos de produtos, avaliar suas experiências com transparência por meio de notas (1 a 5 estrelas) e comentários detalhados, e consumir análises de sentimento e resumos consolidados gerados automaticamente por IA.

### 🌟 Pilares e Funcionalidades Principais:

1. **🔐 Autenticação Completa & Gestão de Sessões Seguras:**
   - **Cadastro (Sign-Up):** Validação estrita de formato de dados com Zod, hashing adaptativo de senhas com `bcryptjs` e prevenção de e-mails duplicados.
   - **Login (Sign-In):** Verificação segura de credenciais com proteção contra enumeração de usuários.
   - **Sessões HTTP-Only:** Gestão de sessão *stateless* assinada digitalmente com HMAC-SHA256 (`src/lib/session.ts`) armazenada em cookies seguros `HttpOnly` com política `SameSite=Lax`.
   - **Contexto Global & Logout:** Verificação reativa de sessão via rota `/api/v1/auth/me`, estado global com React Context (`AuthProvider`) e encerramento de sessão limpo (`/api/v1/auth/sign-out`).

2. **🛍️ Catálogo de Produtos & Experiência de Navegação:**
   - **Home Dinâmica:** Vitrine de produtos em grid responsivo com busca instantânea por nome ou descrição.
   - **Filtros e Ordenação:** Ordenação dinâmica por melhor avaliação, mais recentes e nome.
   - **Cadastro de Novos Produtos:** Endpoint e regras de validação para adicionar novos itens ao catálogo com suporte a links externos e metadados.
   - **Indicadores em Tempo Real:** Badges com nota média consolidada e contador de feedbacks por produto.

3. **⭐ Sistema de Avaliações & Engajamento Comunitário:**
   - **Página de Detalhes do Produto (`/products/[id]`):** Visão completa do item, links externos oficiais e seção de comunidade.
   - **Componente de Avaliação por Estrelas (`StarRating`):** Interação visual e tátil com notas de 1 a 5 estrelas, suporte a teclado e padrões de acessibilidade.
   - **Gating de Autenticação:** Apenas usuários autenticados podem enviar feedbacks, com redirecionamento contextual para login para visitantes não autenticados.
   - **Feedbacks Auditados:** Histórico completo de comentários, notas e autores, com cálculo automático da média global do produto.

4. **🧠 Síntese Inteligente de Avaliações com Agente de IA (Mastra + GPT-4o-mini):**
   - **Agente Especializado:** Agente de inteligência de produto construído com a biblioteca **Mastra (`@mastra/core`)** integrando o modelo **OpenAI GPT-4o-mini**.
   - **Saída Estruturada com Zod:** Síntese em linguagem natural, classificação de sentimento (`positive`, `mixed`, `neutral`, `negative`), extração dos principais prós (pontos fortes), contras (pontos de atenção/ressalvas) e veredito final com recomendação de público ideal.
   - **Interface Dedicada (`AiSummaryCard`):** Card editorial com visual moderno, badges de sentimento coloridos, listas tipadas e suporte a fallback inteligente para execução offline e suíte de testes.

---

## 🎨 Aprimoramento de Front-End com Skills da Anthropic (skills.sh)

Para garantir um padrão estético refinado e evitar clichês de design gerados por IA, foi acoplada ao agente a skill especializada **`frontend-design`**:

* **Fonte / Plataforma:** [skills.sh](https://www.skills.sh)
* **Skill Oficial:** [anthropics/skills/frontend-design](https://www.skills.sh/anthropics/skills/frontend-design)
* **Autoria:** Anthropic
* **Localização no Repositório:** `.agents/skills/frontend-design/SKILL.md`

### Princípios de Design Aplicados:
1. **Ancoragem no Assunto Real:** A interface foi modelada sob a ótica real de reviews de e-commerce e confiança de marca (estrelas douradas em SVG, badges de verificação e métricas claras).
2. **Layout Editorial Assimétrico (Split-Screen):** Telas de autenticação (Sign-Up e Sign-In) utilizando uma divisão vertical elegante com painel de contexto narrativo e formulário limpo.
3. **Princípio da Restrição ("Gastar a ousadia onde importa"):** Foco visual expressivo no card de IA e no showcase de produto, mantendo inputs e botões operacionais sóbrios e acessíveis.
4. **Ergonomia e Microinterações:** Alternador de visibilidade de senha, estados de loading com *skeletons* animados e conformidade com diretrizes WCAG.

---

## 🚀 Tecnologias Utilizadas

### ⚡ Runtime & Testes
* **[Bun](https://bun.sh)** (v1.4+): Runtime JavaScript/TypeScript ultrarrápido utilizado para gerenciamento de dependências, execução de scripts e suíte de testes unitários nativa (`bun test`).

### 💻 Front-End & Interface
* **[Next.js 14](https://nextjs.org)** (App Router): Framework React para roteamento dinâmico, server-side foundations e API routes.
* **[React 18](https://react.dev)** & **[TypeScript](https://www.typescriptlang.org)**: Tipagem estática rigorosa de ponta a ponta.
* **[Tailwind CSS](https://tailwindcss.com)**: Estilização utilitária moderna com suporte a temas e microinterações táteis.
* **[Shadcn UI](https://ui.shadcn.com)**: Primitivas de interface acessíveis e altamente customizáveis (`Button`, `Input`, `Label`, `Card`, `Badge`).
* **[TanStack React Query](https://tanstack.com/query)**: Gerenciamento assíncrono de dados, mutações e cache inteligente.
* **[React Hook Form](https://react-hook-form.com)** + **[Zod](https://zod.dev)**: Validação declarativa e de alta performance de formulários.
* **[Lucide React](https://lucide.dev)**: Biblioteca moderna de ícones vetoriais.

### 🧠 Inteligência Artificial & Agentes
* **[Mastra](https://mastra.ai)** (`@mastra/core`): Framework para orquestração de agentes autônomos de IA e workflows estruturados.
* **OpenAI GPT-4o-mini**: Modelo de linguagem otimizado para extração de sentimento, síntese textual e estruturação de dados.
* **Resiliência / Fallback Inteligente**: Módulo de síntese heurística automatizada que mantém o funcionamento pleno mesmo em ambientes sem conectividade externa ou sem chaves de API configuradas.

### ⚙️ Back-End & Segurança
* **Next.js Route Handlers**: Endpoints RESTful tipados para autenticação, produtos, avaliações e IA.
* **[Bcrypt](https://github.com/dcodeIO/bcrypt.js)** (`bcryptjs`): Hashing adaptativo com `salt` exclusivo para proteção de senhas (OWASP compliance).
* **HMAC-SHA256 Signed Session Cookies**: Mecanismo de sessões criptograficamente assinadas sem dependência de banco em cada requisição.
* **[Nanoid](https://github.com/ai/nanoid)**: Geração de identificadores únicos universais seguros.

### 🗄️ Banco de Dados & Persistência
* **[Supabase](https://supabase.com)** (PostgreSQL): Banco relacional com migrations estruturadas (`accounts`, `products`, `products_feedbacks`).
* **In-Memory Development Store**: Fallback transacional em memória seguro para execução instantânea em testes e desenvolvimento sem dependência obrigatória de banco externo.

### 🧹 Qualidade de Código & Linter
* **[Biome](https://biomejs.dev)**: Substituição veloz do ESLint e Prettier para checagens estáticas e formatação de código (`bun run lint`).

---

## 📁 Estrutura do Repositório

```text
├── .agents/
│   └── skills/
│       └── frontend-design/             # Skill da Anthropic obtida no skills.sh
├── docs/
│   └── ARCHITECTURE.md                  # Especificação arquitetural do projeto
├── plans/                               # Planos de execução orientados a agentes
│   ├── feedback.md                      # Plano de implementação do sistema de feedbacks
│   ├── home.md                          # Plano da Home e catálogo de produtos
│   └── sign-in.md                       # Plano da tela e fluxo de autenticação
├── specs/                               # Especificações técnicas funcionais
│   ├── _template.md                     # Template padrão de especificação
│   ├── feedback.md                      # Especificação de feedbacks e avaliações
│   ├── home.md                          # Especificação da home e produtos
│   ├── sign-in.md                       # Especificação do fluxo de login
│   └── sign-up.md                       # Especificação do fluxo de cadastro
├── supabase/
│   └── migrations/
│       ├── 001_create_accounts.sql      # Tabela de contas de usuários
│       ├── 002_create_products.sql      # Tabela de produtos e índices
│       └── 003_create_products_feedbacks.sql # Tabela de avaliações e relacionamentos
├── src/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── auth/
│   │   │   │   ├── me/route.ts          # GET /api/v1/auth/me (verificação de sessão)
│   │   │   │   └── sign-out/route.ts    # POST /api/v1/auth/sign-out (logout)
│   │   │   ├── products/
│   │   │   │   ├── route.ts             # GET & POST /api/v1/products
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts         # GET /api/v1/products/:id
│   │   │   │       ├── feedbacks/route.ts # GET & POST /api/v1/products/:id/feedbacks
│   │   │   │       └── summary/route.ts # GET /api/v1/products/:id/summary (IA Mastra)
│   │   │   ├── sign-in/route.ts         # POST /api/v1/sign-in (login)
│   │   │   └── sign-up/route.ts         # POST /api/v1/sign-up (cadastro)
│   │   ├── auth/
│   │   │   ├── sign-in/page.tsx         # Página de login (Editorial Split)
│   │   │   └── sign-up/page.tsx         # Página de cadastro (Editorial Split)
│   │   ├── products/[id]/page.tsx       # Detalhes do produto, resumo de IA e avaliações
│   │   ├── globals.css                  # Variáveis CSS e tokens de design
│   │   ├── layout.tsx                   # Layout raiz com AuthProvider e QueryProvider
│   │   └── page.tsx                     # Landing / Home com catálogo interativo
│   ├── components/
│   │   ├── feedback/
│   │   │   ├── feedback-form.tsx        # Formulário de envio de feedback
│   │   │   ├── feedback-list.tsx        # Lista de comentários e notas
│   │   │   └── star-rating.tsx          # Componente interativo de estrelas (1 a 5)
│   │   ├── layout/
│   │   │   └── header.tsx               # Barra de navegação com estado do usuário
│   │   ├── products/
│   │   │   ├── ai-summary-card.tsx      # Card de síntese de IA (Mastra)
│   │   │   ├── product-card.tsx         # Card de produto com nota média
│   │   │   └── product-grid.tsx         # Grid com busca e ordenação
│   │   ├── providers/
│   │   │   ├── auth-provider.tsx        # Provider de contexto de autenticação
│   │   │   └── query-provider.tsx       # Provider do TanStack React Query
│   │   └── ui/                          # Componentes atômicos do Shadcn
│   └── lib/
│       ├── auth.ts                      # Utilitários de hash e salt com Bcrypt
│       ├── feedbacks.ts                 # Operações de feedbacks e cálculo de médias
│       ├── mastra/
│       │   └── agent.ts                 # Configuração do Agente Mastra e GPT-4o-mini
│       ├── products.ts                  # Operações de banco e repositório de produtos
│       ├── session.ts                   # Sessões assinadas com HMAC-SHA256 e cookies
│       ├── supabase.ts                  # Cliente Supabase
│       ├── utils.ts                     # Utilitário cn()
│       └── validations/                 # Schemas Zod (auth, feedback, product)
├── tests/
│   ├── ai-summary.test.ts               # Testes da síntese de IA e endpoint de resumo
│   ├── feedback.test.ts                 # Testes de envio e listagem de feedbacks
│   ├── home.test.ts                     # Testes do catálogo de produtos e paginação
│   ├── sign-in.test.ts                  # Testes de autenticação e sessão
│   └── sign-up.test.ts                  # Testes de criação de contas e validações
├── biome.json                           # Configurações do Biome (linter & formatter)
├── package.json
└── tsconfig.json
```

---

## 🔌 Endpoints da API (RESTful)

| Método | Endpoint | Descrição | Autenticação Requerida |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/sign-up` | Criação de nova conta de usuário | Não |
| `POST` | `/api/v1/sign-in` | Autenticação de credenciais e emissão do cookie de sessão | Não |
| `POST` | `/api/v1/auth/sign-out` | Limpeza do cookie de sessão e encerramento | Não |
| `GET` | `/api/v1/auth/me` | Retorna os dados do usuário autenticado na sessão ativa | Sim (via cookie) |
| `GET` | `/api/v1/products` | Lista produtos cadastrados (com paginação e busca) | Não |
| `POST` | `/api/v1/products` | Cadastra um novo produto no catálogo | Não |
| `GET` | `/api/v1/products/:id` | Retorna os detalhes de um produto específico | Não |
| `GET` | `/api/v1/products/:id/feedbacks` | Lista feedbacks e estatísticas de notas do produto | Não |
| `POST` | `/api/v1/products/:id/feedbacks` | Envia uma nova avaliação com nota (1-5) e comentário | **Sim** (via cookie) |
| `GET` | `/api/v1/products/:id/summary` | Gera síntese inteligente com IA Mastra (sentimento, prós, contras e veredito) | Não |

---

## 🛠️ Como Executar o Projeto Localmente

### Pré-requisitos
* **[Bun](https://bun.sh)** instalado (v1.4 ou superior) ou **Node.js** (v20+).

### 1. Clonar e Instalar Dependências
```bash
git clone https://github.com/Xicojr/modulo-engajamento-sistema-avalizacao0produto.git
cd modulo-engajamento-sistema-avalizacao0produto
bun install
```

### 2. Configurar Variáveis de Ambiente (Opcional)
Copie o arquivo de exemplo para `.env.local`:
```bash
cp .env.example .env.local
```
Variáveis disponíveis no arquivo `.env.example`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# OpenAI Configuration (para o Agente Mastra sintetizar avaliações com GPT-4o-mini)
OPENAI_API_KEY=your-openai-api-key-here
```
> **Nota de Resiliência:** Caso não configure as chaves do Supabase ou da OpenAI, a aplicação continuará funcionando perfeitamente em modo de desenvolvimento local utilizando os fallbacks em memória e heurísticas inteligentes integradas.

### 3. Iniciar o Servidor de Desenvolvimento
```bash
bun run dev
```

Acesse a aplicação no navegador:
* **Página Inicial (Catálogo):** [http://localhost:3000](http://localhost:3000)
* **Entrar (Sign-In):** [http://localhost:3000/auth/sign-in](http://localhost:3000/auth/sign-in)
* **Cadastro (Sign-Up):** [http://localhost:3000/auth/sign-up](http://localhost:3000/auth/sign-up)
* **Detalhes do Produto com Resumo de IA:** [http://localhost:3000/products/1](http://localhost:3000/products/1)

---

## 🧪 Testes Automatizados & Qualidade de Código

O projeto conta com uma cobertura rigorosa de testes cobrindo todos os módulos da aplicação:

### Executar a Suíte de Testes (36 testes automatizados)
```bash
bun test
```
Resultados das suítes de teste:
- `tests/sign-up.test.ts`: Validações de payload, integridade de senhas e prevenção de duplicidade.
- `tests/sign-in.test.ts`: Autenticação correta, emissão de cookies de sessão HMAC-SHA256, `/me` e logout.
- `tests/home.test.ts`: Listagem paginada, filtros, busca e criação de produtos.
- `tests/feedback.test.ts`: Submissão de notas e comentários, gating de autenticação e agregação de médias.
- `tests/ai-summary.test.ts`: Resumo estruturado de IA via Agente Mastra, análise de sentimento e rotas de resumo.

### Checagem de Lint e Formatação com Biome
```bash
bun run lint
# para correções automáticas de formatação e imports:
bun run lint:fix
```

### Build de Produção
```bash
bun run build
```

---

## 🎓 Contexto Acadêmico

* **Instituição:** Coders University
* **Curso:** Pós-Graduação em Engenharia de IA
* **Módulo:** Módulo 0 (Iniciação / Alinhamento Técnico)
* **Docente / Instrutor:** Prof. Matheus Castiglioni (Coders University)
* **Repositório Oficial:** [https://github.com/Xicojr/modulo-engajamento-sistema-avalizacao0produto](https://github.com/Xicojr/modulo-engajamento-sistema-avalizacao0produto)
* **Metodologia:** Desenvolvimento de software assistido e co-criado em regime de *Pair Programming* com Agente Autônomo de IA (**Google Antigravity / `agy`**), com front-end refinado pela skill **`frontend-design`** da Anthropic ([skills.sh](https://www.skills.sh/anthropics/skills/frontend-design)) e agente de inteligência de produto orquestrado com **Mastra (`@mastra/core`)**.
