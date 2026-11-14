# Módulo de Engajamento & Sistema de Avaliação de Produtos

Projeto desenvolvido no **Módulo 0 (Iniciação)** da **Pós-Graduação em Engenharia de IA** pela **Coders University**. 

A proposta central do projeto é a construção de uma aplicação Web completa para **engajamento e avaliação de produtos**, desenvolvida em colaboração direta com Inteligência Artificial (regime de *Pair Programming* com agentes autônomos). Embora a ementa do curso sugerisse originalmente o uso do *Claude*, o projeto foi planejado, arquitetado e implementado integralmente utilizando o **Antigravity (`agy`)**, comprovando a versatilidade e potência dos fluxos orientados a especificações técnicas.

---

## 🎯 Sobre o Projeto

O sistema tem como objetivo permitir que usuários avaliem produtos com transparência, forneçam notas e comentários auditados, gerando métricas de satisfação e fortalecendo a reputação de marcas em plataformas de e-commerce.

Nesta etapa inicial de fundação da plataforma, foi implementado o fluxo completo de **Criação de Contas (Sign-Up)**, projetado segundo princípios avançados de design UI/UX (*editorial split-screen*, validações instantâneas, segurança com hashing adaptativo e comunicação tipada de ponta a ponta).

---

## 🎨 Aprimoramento de Front-End com Skills da Anthropic (skills.sh)

Para elevar o nível estético da interface e evitar os vícios comuns de designs gerados por inteligência artificial (como cartões genéricos flutuantes, cores clichês e espaçamentos padronizados sem contexto), foi incorporada ao agente a skill especializada **`frontend-design`**:

* **Fonte / Plataforma:** [skills.sh](https://www.skills.sh)
* **Skill Oficial:** [anthropics/skills/frontend-design](https://www.skills.sh/anthropics/skills/frontend-design)
* **Autoria:** Anthropic
* **Localização no Repositório:** `.agents/skills/frontend-design/SKILL.md`

### Como a Skill orientou o Redesign da Aplicação:
1. **Ancoragem no Assunto Real:** A interface foi conectada diretamente ao universo de avaliações de produto (avaliações verificadas, notas por estrelas douradas, índices de satisfação e citações reais de impacto no e-commerce).
2. **Abandono do "SaaS-Card Kit" Genérico:** Substituição da tradicional caixa branca centralizada por um **layout assimétrico em duas colunas (Editorial Split)** de altura total.
3. **Princípio da Restrição (*"Gastar a ousadia em um único lugar"*):** Toda a expressividade visual foi concentrada no *Showcase* lateral de contexto, mantendo o formulário operacional limpo, acessível e funcional.
4. **Ergonomia e Microinterações:** Rótulos objetivos em *sentence case*, alternador de visibilidade de senha integrado, estados claros de carregamento e foco acessível compatível com as diretrizes WCAG.

---

## 🚀 Tecnologias Utilizadas

A stack foi escolhida de acordo com a documentação de arquitetura ([docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)) e refinada durante a execução prática:

### ⚡ Runtime & Gerenciador de Pacotes
* **[Bun](https://bun.sh)** (v1.4+): Utilizado como runtime all-in-one de alta performance para instalação de dependências, execução de scripts e execução da suíte de testes unitários com o test runner nativo (`bun test`).

### 💻 Front-End & Interface
* **[Frontend Design Skill (Anthropic)](https://www.skills.sh/anthropics/skills/frontend-design)**: Injetada via [skills.sh](https://www.skills.sh) para capacitar o agente com princípios de design editorial, hierarquia tipográfica e direcionamento estético de ponta.
* **[Next.js 14](https://nextjs.org)** (App Router): Framework React para estruturação da aplicação, rotas e renderização moderna.
* **[React 18](https://react.dev)** & **[TypeScript](https://www.typescriptlang.org)**: Base da aplicação com tipagem estática rigorosa de ponta a ponta.
* **[Tailwind CSS](https://tailwindcss.com)**: Estilização utilitária responsiva com suporte a temas e microinterações táteis.
* **[Shadcn UI](https://ui.shadcn.com)**: Primitivas de interface acessíveis e componíveis (`Button`, `Input`, `Label`, `Card`, `Alert`).
* **[TanStack React Query](https://tanstack.com/query)**: Gerenciamento de estado assíncrono, cache e mutações na comunicação com a API.
* **[React Hook Form](https://react-hook-form.com)** + **[Zod](https://zod.dev)**: Validação declarativa e de alta performance de formulários no lado do cliente.
* **[Lucide React](https://lucide.dev)**: Conjunto moderno de ícones de interface.

### ⚙️ Back-End & Segurança
* **Next.js Route Handlers (`/api/v1/sign-up`)**: Endpoints de API estruturados para processar requisições `POST` com payloads JSON.
* **[Bcrypt](https://github.com/dcodeIO/bcrypt.js)** (`bcryptjs`): Hashing adaptativo e geração de `salt` exclusivo para armazenamento seguro de credenciais, seguindo as melhores práticas OWASP.
* **[Nanoid](https://github.com/ai/nanoid)**: Geração de identificadores únicos para as contas criadas na camada de API.

### 🗄️ Banco de Dados & Persistência
* **[Supabase](https://supabase.com)** (PostgreSQL): Banco relacional com schema e migration dedicados ([supabase/migrations/001_create_accounts.sql](supabase/migrations/001_create_accounts.sql)) para a tabela `accounts`.
* **Fallback de Desenvolvimento**: Mecanismo de persistência em memória seguro para permitir execução e testes instantâneos caso credenciais remotas não estejam configuradas.

### 🧹 Linter & Padronização
* **[Biome](https://biomejs.dev)**: Ferramenta moderna que substitui ESLint e Prettier com checagens estáticas e formatação de código quase instantâneas (`bun run lint`).

---

## 📁 Estrutura do Repositório

```text
├── .agents/
│   └── skills/
│       └── frontend-design/     # Skill da Anthropic obtida no skills.sh
├── docs/
│   └── ARCHITECTURE.md          # Especificação da arquitetura e decisões de stack
├── specs/
│   ├── _template.md             # Template padrão de especificações técnicas
│   └── sign-up.md               # Especificação funcional do fluxo de cadastro
├── supabase/
│   └── migrations/
│       └── 001_create_accounts.sql  # Script de criação da tabela 'accounts'
├── src/
│   ├── app/
│   │   ├── api/v1/sign-up/      # Route Handler (POST /api/v1/sign-up)
│   │   ├── auth/
│   │   │   └── sign-up/         # Página de cadastro e página de sucesso (/sucess)
│   │   ├── globals.css          # Variáveis CSS e tokens de design Shadcn/Tailwind
│   │   ├── layout.tsx           # Layout raiz com QueryProvider
│   │   └── page.tsx             # Página inicial / Landing
│   ├── components/
│   │   ├── providers/           # QueryProvider (TanStack Query)
│   │   └── ui/                  # Componentes reutilizáveis Shadcn
│   └── lib/
│       ├── auth.ts              # Utilitários de hash e salt com Bcrypt
│       ├── supabase.ts          # Inicialização e cliente do Supabase
│       ├── utils.ts             # Função utilitária cn() para classes Tailwind
│       └── validations/         # Schemas de validação Zod (auth.ts)
├── tests/
│   └── sign-up.test.ts          # Testes automatizados da API de cadastro
├── biome.json                   # Configurações do Biome (linter & formatter)
├── package.json
└── tsconfig.json
```

---

## 🛠️ Como Executar o Projeto Localmente

### Pré-requisitos
* **[Bun](https://bun.sh)** instalado (v1.4 ou superior) ou **Node.js** (v20+).

### 1. Clonar e Instalar Dependências
```bash
git clone <URL_DO_REPOSITORIO>
cd modulo-engajamento-sistema-avalizacao0produto
bun install
```

### 2. Configurar Variáveis de Ambiente (Opcional)
Copie o arquivo de exemplo e configure suas chaves do Supabase, se desejar conectar a uma instância externa de banco:
```bash
cp .env.example .env.local
```
> **Nota:** Caso não configure as chaves do Supabase, a aplicação executará perfeitamente utilizando o fallback em memória seguro para desenvolvimento e testes.

### 3. Iniciar o Servidor de Desenvolvimento
```bash
bun run dev
```
Acesse a aplicação no navegador:
* **Página Inicial:** [http://localhost:3000](http://localhost:3000)
* **Cadastro (Sign-Up):** [http://localhost:3000/auth/sign-up](http://localhost:3000/auth/sign-up)
* **Página de Sucesso:** [http://localhost:3000/auth/sign-up/sucess](http://localhost:3000/auth/sign-up/sucess)

---

## 🧪 Testes Automatizados & Qualidade de Código

### Rodar Testes
Os testes validam cenários de sucesso (status 201), erros de validação (status 400) e conflito de duplicidade de e-mail (status 409):
```bash
bun test
```

### Checagem de Lint e Formatação
```bash
bun run lint
# ou para aplicar correções automáticas:
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
* **Metodologia:** Desenvolvimento assistido e co-criado com Agente Autônomo de IA (**Antigravity / `agy`**) potencializado pela skill **frontend-design** da Anthropic ([skills.sh](https://www.skills.sh/anthropics/skills/frontend-design)).
