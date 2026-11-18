# Plano de Implementação: Sign-In (Autenticação)

## 1. Visão Geral e Escopo
- **Spec de Referência**: `specs/sign-in.md`
- **Escopo**: Front-End, Back-End
- **Objetivo**: Permitir que usuários com contas previamente criadas realizem autenticação na plataforma através de e-mail e senha, gerenciando sessão segura via cookies HTTP-only no Next.js, exibindo feedback visual de erros e sucesso, e atualizando o cabeçalho global com o avatar e dados da pessoa conectada.

---

## 2. Decisões de Arquitetura e Contratos

### 2.1 Gestão de Sessão via Cookies (`src/lib/session.ts`)
- **Mecanismo**: Token de sessão assinado com HMAC-SHA256 (módulo `crypto` nativo do Node/Bun, sem dependências adicionais).
- **Nome do Cookie**: `auth_session`
- **Atributos de Segurança**: `HttpOnly`, `Path=/`, `SameSite=Lax`, `Max-Age=604800` (7 dias), `Secure` (em produção).
- **Payload da Sessão**:
  ```ts
  export interface SessionUser {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  }
  ```
- **Funções Exportadas no Contrato**:
  - `createSessionToken(user: SessionUser): string`
  - `verifySessionToken(token: string): SessionUser | null`
  - `getSessionUser(request?: Request): Promise<SessionUser | null>` (lê cookies via `next/headers` ou `Request`)
  - `setSessionCookie(user: SessionUser, responseHeaders?: Headers): void`
  - `clearSessionCookie(responseHeaders?: Headers): void`

### 2.2 Validação de Entrada (`src/lib/validations/auth.ts`)
- Extensão do módulo de validação com o schema `signInSchema`:
  - `email`: obrigatório, formato de e-mail válido, `toLowerCase()`, `trim()`.
  - `password`: obrigatório, string não vazia.

### 2.3 Endpoints de API
1. **`POST /api/v1/sign-in`**:
   - Recebe `{ email, password }` via JSON no corpo.
   - Valida formatação dos dados: se inválido, responde `400 Bad Request`.
   - Busca conta no banco via `findAccountByEmail(email)` (tabela `accounts`).
   - Compara senha com `comparePassword(password, account.password)`.
   - Se a conta não existir ou a senha não coincidir:
     - **Importante (Requisito 2)**: Retorna status `401 Unauthorized` com mensagem estritamente genérica:
       ```json
       { "error": "Email ou senha inválidos." }
       ```
   - Se as credenciais forem válidas:
     - Gera o token de sessão e define o cookie `auth_session`.
     - Retorna status `200 OK` com dados públicos do usuário autenticado:
       ```json
       {
         "message": "Autenticação realizada com sucesso!",
         "user": {
           "id": "...",
           "first_name": "...",
           "last_name": "...",
           "email": "..."
         }
       }
       ```
2. **`GET /api/v1/auth/me`**:
   - Inspeciona o cookie `auth_session` e retorna `{ user: SessionUser | null }`.
3. **`POST /api/v1/auth/sign-out`**:
   - Limpa o cookie de sessão (`Max-Age=0`) e retorna `200 OK`.

---

## 3. Componentes e Interface (UI/UX)

### 3.1 Contexto e Hook de Autenticação (`src/components/providers/auth-provider.tsx`)
- Provedor React com estado `user`, `isLoading`, `signIn(credentials)` e `signOut()`.
- Sincroniza estado com `GET /api/v1/auth/me` na carga inicial e permite reatividade em tempo real.

### 3.2 Página de Login (`src/app/auth/sign-in/page.tsx`)
- Formulário estilizado com Tailwind CSS e componentes Shadcn (`Card`, `Input`, `Button`, `Label`, `Alert`).
- Integração com `react-hook-form` e `zodResolver(signInSchema)`.
- Estado de carregamento nos botões com spinner.
- Exibição de alertas de erro em bloco vermelho quando houver falha de autenticação (401 ou 400).
- Redirecionamento para a Home (`/`) após login com sucesso.
- Link de navegação para a página de criação de conta (`/auth/sign-up`).

### 3.3 Cabeçalho Global da Plataforma (`src/components/layout/header.tsx`)
- Integrado ao layout base (`src/app/layout.tsx`).
- **Estado Não Logado**:
  - Botão "Entrar" com link para `/auth/sign-in`.
  - Botão "Criar conta" com link para `/auth/sign-up`.
- **Estado Logado**:
  - Avatar gerado via DiceBear Initials (`https://api.dicebear.com/7.x/initials/svg?seed=${first_name}+${last_name}`).
  - Exibição do nome completo (`${first_name} ${last_name}`) e e-mail.
  - Botão de logout ("Sair") que invoca `signOut()` e limpa a sessão.

---

## 4. Arquivos a Criar ou Modificar
- `src/lib/session.ts` *(Novo)*: Implementação de tokens e leitura de cookies.
- `src/lib/validations/auth.ts` *(Modificação)*: Adicionar `signInSchema` e tipagem `SignInInput`.
- `src/app/api/v1/sign-in/route.ts` *(Novo)*: Handler de login com validação, consulta ao banco e emissão de cookie.
- `src/app/api/v1/auth/me/route.ts` *(Novo)*: Verificação da sessão ativa.
- `src/app/api/v1/auth/sign-out/route.ts` *(Novo)*: Revogação da sessão.
- `src/components/providers/auth-provider.tsx` *(Novo)*: Contexto global de autenticação.
- `src/components/layout/header.tsx` *(Novo)*: Cabeçalho com detecção de estado autenticado vs visitante.
- `src/app/auth/sign-in/page.tsx` *(Novo)*: Página de sign-in com formulário e alertas.
- `src/app/layout.tsx` *(Modificação)*: Envolver com `AuthProvider` e renderizar o `Header`.
- `tests/sign-in.test.ts` *(Novo)*: Testes automatizados cobrindo os cenários 200, 400, 401 e cookies.

---

## 5. Critérios de Teste e Validação
1. **Credenciais Válidas**: Requisição POST com e-mail/senha corretos retorna `200`, seta header `Set-Cookie` com `auth_session` e retorna dados do usuário.
2. **Credenciais Inválidas**: E-mail inexistente ou senha incorreta retorna `401` com a mensagem exata `"Email ou senha inválidos."`.
3. **Formatação Inválida**: Requisição sem JSON ou e-mail inválido retorna `400`.
4. **Sessão Persistente**: `GET /api/v1/auth/me` com cookie válido recupera o usuário autenticado.
5. **Navegação UI**: Submeter login válido na UI redireciona para a Home (`/`), alterando o cabeçalho para exibir o avatar e nome do usuário.
6. **Suíte Automatizada**: `bun test tests/sign-in.test.ts` e `bun run lint` passam sem erros.
