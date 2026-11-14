# Sign-Up (Criação de conta)

## Escopo

Front-End, Back-End, Banco de Dados

## Contexto

Precisamos implementar o fluxo para criação de contras na plataforma, as pessoas precisarão fornecer:

- Primeiro Nome
- Sobrenome
- Email
- Senha
- Confirmação de senha

## Requisitos funcionais

1. Precisamos adicionar validação no formulário na camada de cliente
    1. Caso o formulário esteja váliso podemos enviar a requisição para a API
2. Os campos de nome e sobrenome devem ser separados
3. Precisamos criar uma nova conta no banco de dados na tabela 'accounts'
    1. 'id': nanoid (gerado com 'nanoid' na camada de API)
    2. first_name: text
    3. last_name: text
    4. created_at: timestamp
    5. updated_at: timestamp
    6. email: text
    7. password: text (hashed)
    8. salt: text (hashed)
4. A requisição deve ser um 'POST' para 'api/v1/sign-up' e receber os dados como JSON no 'body'
5. Caso tudo dê certo retornar '201' ou erros de acordo com a violação:
    1. '400': Má formatação de dados

## Requisitos não funcionais

- Segurança: Precisamos salvar as senhas de forma segura no banco de dados
  - Precisamos receber os dados do cliente de forma segura usando HTTPS (para previnir network sniff)
- UI/UX: Boa experiência de uso através de uma interface bonita, elegante, moderna
- Performance: O processo de criação de conta precisa ser rápido

## Você deve

- Criar a base do projeto com um endpoint inicial para a criação de conta
- Criar a base do projeto com uma página inicial para a interface de criação de conta
- Configurar as bibliotecas base

## Você não deve

- Implementar qualquer outra funcionalidade que não esteja relacionada com sign-up (criação de contas).
- Não vamos realizar nenhum envio de email no momento, apenas processar a requisição, salvar no banco de dados e tornar um sucesso.

## Tecnologias (Stack)

React.js, Next.js, React-Hook-Form, Shadcn, Tailwind, Supabase, TRCP, Bun.js

## Criterios de aceitação

- Temos uma página para criar a mova conta em '/auth/sign-up'
- A paǵina contém um formulário com validação
- A plataforma consegue se comunicar com a API para enviar os dados e receber uma resposta
- Estamos informando possíveis erros
  - Mostrar um alert em vermelho no formulário
- Estamos informando o sucesso de criação de contas:
  - Navegar para '/auth/sign-up/sucess'

## Resultado

Pessoas conseguem criar um nova conta na plataforma.