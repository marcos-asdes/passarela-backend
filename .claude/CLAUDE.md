# Passarela (backend) — Guia do Projeto

Backend do **Passarela**, MVP de uma plataforma onde lojistas de um shopping publicam ofertas relâmpago e compradores acompanham em tempo real as promoções ativas, podendo expressar interesse. Projeto desenvolvido para um desafio técnico de vaga (dev fullstack pleno).

## Índice

1. [Estado atual](#estado-atual)
2. [Stack e Versões](#stack-e-versões)
3. [Arquitetura DDD](#arquitetura-ddd)
4. [Path Aliases](#path-aliases)
5. [Convenções de Código](#convenções-de-código)
6. [Testes](#testes)
7. [Docker](#docker)
8. [Idioma](#idioma)

---

## Estado atual

Primeiro commit trouxe **só o esqueleto técnico** (tooling, Docker, hello-world). Segundo commit adicionou o **kernel compartilhado**: `ConfigModule` (`@nestjs/config` + validação via `class-validator`), `DatabaseModule` (Mongoose + MongoDB), `SharedModule` (helmet, CORS, `@nestjs/throttler`, filtro de exceção global `AllExceptionsFilter`) — mesmo padrão `src/shared`/`src/database`/`src/config` do Ludora. Terceiro commit adicionou o bounded context **`auth`** (`src/modules/auth/`): registro/login separados (registro não emite token), papéis `seller`/`customer`, hash de senha argon2id, JWT (HS256, `@nestjs/jwt`+`passport-jwt`) com sessão controlada pelo banco (`sessions`, revogável), `ValidationPipe` global ativado. Detalhes de segurança e decisões em `.claude/plans/plano-auth.md`.

Ordem planejada dos próximos commits incrementais (não implementado ainda, só para orientar decisões de estrutura):
1. ~~Kernel compartilhado~~ ✅ feito.
2. ~~Bounded context `auth`~~ ✅ feito — registro/login de `seller` e `customer`, JWT.
3. Bounded context `offers` — CRUD de offers pelo seller, endpoint público de listagem/filtro por status.
4. Bounded context `interest` — customer registra interest, decremento de estoque.
5. Gateway WebSocket — notifica customers conectados quando uma nova offer é publicada.

Ao adicionar cada um desses, replicar a arquitetura DDD de 4 camadas descrita abaixo e atualizar a tabela de path aliases.

---

## Stack e Versões

| Item | Versão instalada em 2026-07-04 | Reconfirmar com |
|---|---|---|
| Node.js | 24.14.0 (LTS "Krypton") | `node -v` / `.nvmrc` |
| NestJS (`@nestjs/core` e demais `@nestjs/*`) | 11.1.27 | `npm view @nestjs/core version` |
| `@nestjs/config` | 4.0.4 | `npm view @nestjs/config version` |
| `@nestjs/mongoose` | 11.0.4 | `npm view @nestjs/mongoose version` |
| `@nestjs/throttler` | 6.5.0 | `npm view @nestjs/throttler version` |
| `class-validator` / `class-transformer` | 0.15.1 / 0.5.1 | `npm view class-validator version` |
| `helmet` | 8.2.0 | `npm view helmet version` |
| `@nestjs/jwt` | 11.0.2 | `npm view @nestjs/jwt version` |
| `@nestjs/passport` / `passport` / `passport-jwt` | 11.0.5 / 0.7.0 / 4.0.1 | `npm view @nestjs/passport version` |
| `argon2` | 0.44.0 | `npm view argon2 version` |
| `ms` | 2.1.3 | `npm view ms version` |
| MongoDB (imagem Docker) | `mongo:8.0` | `docker pull mongo:8.0` |
| Mongoose | 9.7.3 | `npm view mongoose version` |
| SWC (`@swc/core`, `@swc/cli`, `@swc/jest`) | 1.15.43 / 0.8.1 / 0.2.39 | `npm view @swc/core version` |
| Jest | 30.4.2 | `npm view jest version` |
| TypeScript | 6.0.3 | `npm view typescript version` |
| npm | 11.11.0 | `npm -v` |

**Regra operacional** (herdada do Ludora): estes números são o estado observado na criação do projeto, não valores para colar cegamente em atualizações futuras. Ao adicionar uma dependência nova, usar `npm install <pacote>@latest` e deixar o `package-lock.json` registrar a versão real resolvida — nunca copiar um número de versão de outro projeto sem reconfirmar.

### Por que reaproveitar a stack do Ludora

Mesmo racional documentado lá: NestJS 11/CommonJS (não v12/ESM ainda), Jest + `@swc/jest` (não Vitest), Express (não Fastify) — decisões de menor risco e já validadas ponta a ponta em outro projeto real. Não foram reavaliadas aqui porque nada no desafio técnico exige o contrário.

---

## Arquitetura DDD

Mesmo padrão do Ludora: cada bounded context é um módulo Nest com 4 camadas, sempre na mesma ordem de dependência (uma camada só pode depender das que vêm antes dela nesta lista):

1. **`domain/`** — entidades e value objects. TypeScript puro, zero import de Nest/Mongoose/qualquer framework. Só regra de negócio (ex.: uma `Offer` não pode ter estoque negativo).
2. **`application/`** — casos de uso (use cases) e as portas (interfaces) que eles precisam. Conhece `domain/`, nunca conhece `infrastructure/` diretamente — depende só das interfaces que ela mesma declara.
3. **`infrastructure/`** — implementação das portas declaradas em `application/`. É a única camada que sabe que o banco é MongoDB/Mongoose.
4. **`interface/`** — controllers HTTP, gateways WebSocket, DTOs de entrada/saída. Fala só com `application/` (use cases), nunca importa `infrastructure/` diretamente.

Exemplo real: `src/modules/auth/` (registro/login) — mesmo jeito que o Ludora aponta pra `src/modules/games/`. Ao criar `offers`/`interest`, seguir a mesma estrutura.

---

## Path Aliases

Zero imports relativos em todo o projeto (`src/` e `__tests__/`) — sempre via alias.

| Alias | Aponta para |
|---|---|
| `@app/*` | `src/*` (arquivos soltos na raiz: `main.ts`, `app.module.ts`, `app.controller.ts`, `types.ts`) |
| `@config`, `@config/*` | `src/config` |
| `@database`, `@database/*` | `src/database` |
| `@shared`, `@shared/*` | `src/shared` |
| `@auth/*` | `src/modules/auth/*` |

Conforme bounded contexts forem criados (`offers`, `interest`, etc.), cada um ganha seu próprio alias (ex.: `@offers/*`) — um por contexto, não um `@modules/*` genérico, pelo mesmo motivo do Ludora: torna violação de fronteira entre contextos visível no import. Bounded contexts (diferente do kernel `config`/`database`/`shared`) só ganham o alias `*` — sem bare alias, sem barrel `index.ts` (confirmado no padrão do Ludora: `@games/*` existe, `@games`/`src/modules/games/index.ts` não).

**Definido em dois lugares que precisam ficar sincronizados manualmente**: `tsconfig.json` (`compilerOptions.paths`) e `jest.config.ts` (`moduleNameMapper`). Ao adicionar/renomear/remover um alias, atualizar os dois.

**Resolução em runtime**: SWC não reescreve aliases como `tsc+webpack` fariam. Por isso os scripts `start`/`start:dev`/`start:debug`/`start:prod` carregam `tsconfig-paths/register` via `NODE_OPTIONS`, e `TS_NODE_BASE_URL=./dist` corrige a raiz de resolução (SWC compila `src/main.ts` → `dist/src/main.js`, preservando o caminho completo, não `dist/main.js`).

---

## Convenções de Código

- **`types.ts` sempre**: toda interface/type vive em um `types.ts` próprio da pasta — nunca inline em controller/service/entity/schema.
- **JSDoc curto**: interfaces, classes, módulos e métodos ganham um comentário `/** ... */` de uma linha explicando o propósito (não o "o quê", que o nome já diz).
- **JSDoc multi-linha**: quando não cabe em uma linha, formato bloco — `/**` sozinho na primeira linha, cada linha de conteúdo começando com `* `, `*/` sozinho na última. Nunca `/** ... texto longo ... */` tudo numa linha só. Exemplo:
  ```ts
  /**
   * Caso de uso chamado a cada request autenticada (via JwtStrategy.validate()): confere sessão ativa
   * E usuário ainda existente — dá revogação real (deletar usuário/revogar sessão derruba o token na hora
   * seguinte, não só na expiração natural). Retorna null quando qualquer uma das checagens falha.
   */
  ```
- **Zero imports relativos**: sempre via alias, mesmo para arquivos vizinhos na mesma pasta.
- **Nunca `require()`, nunca `eslint-disable`**: sempre ES imports. Se o ESLint reclama, o código é ajustado para satisfazer a regra, não suprimido.
- **Nomenclatura de arquivo por papel**: `*.entity.ts` (domain), `*.use-case.ts` (application), `*.schema.ts` / `*.repository.ts` (infrastructure), `*.dto.ts` / `*.controller.ts` / `*.gateway.ts` (interface), `*.module.ts` (composição Nest).
- **Barrel files (`index.ts`) fora do coverage**: todo `index.ts` que só reexporta (`export { X } from '...'`) abre com `/* v8 ignore start */` na primeira linha, pra não contar como código não coberto.

---

## Testes

- **Localização**: `__tests__/` na raiz do projeto (não dentro de `src/`), espelhando a estrutura de `src/` 1:1.
- **Sufixo**: `.spec.ts`.
- **Framework**: Jest + `@swc/jest`.
- **Cabeçalho obrigatório "Cenários testados"**: todo `*.spec.ts` abre com um bloco JSDoc listando os cenários cobertos naquele arquivo (ver `__tests__/app.controller.spec.ts` para o formato). Esta lista deve ser atualizada manualmente sempre que um `describe`/`it` for adicionado, editado ou removido.
- **Idioma**: todo `describe`/`it` em pt-BR com acentuação.
- **`reflect-metadata` via `setupFiles`**: classes decoradas com `class-validator`/`class-transformer` (ex.: `EnvironmentVariables` em `env.validation.ts`) precisam de `Reflect.getMetadata` definido *antes* de a classe ser carregada. Um `import 'reflect-metadata'` dentro do próprio spec é frágil — organizadores de import (IDE/lint) podem reordenar e quebrar silenciosamente a leitura de `design:type`. Por isso `jest.config.ts` carrega `reflect-metadata` via `setupFiles`, garantindo a ordem independente do que o spec importa.

---

## Docker

Desenvolvimento preferencial via Docker, mas tudo deve funcionar fora dele também.

```bash
cp .env.example .env
docker compose up --build   # fast refresh via bind mount de src/ e __tests__/
```

Fora do Docker:

```bash
cp .env.example .env
npm install
npm run start:dev
```

`docker-compose.yml` tem os serviços `api` e `mongo` (imagem `mongo:8.0`, porta host `27019` pra não colidir com o Mongo do Ludora que usa `27018`). `api` só sobe depois do `mongo` ficar saudável (`depends_on: condition: service_healthy`).

---

## Idioma

Documentação, comentários e nomes de `describe`/`it` em **pt-BR com acentuação**. Identificadores de código (variáveis, funções, classes) em inglês, como de costume.
