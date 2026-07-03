# Passarela (backend) — Guia do Projeto

Backend do **Passarela**, MVP de uma plataforma onde lojistas de um shopping publicam ofertas relâmpago e compradores acompanham em tempo real as promoções ativas, podendo expressar interesse. Projeto desenvolvido para um desafio técnico de vaga (dev fullstack pleno) — ver `desafio-full.md` na raiz para o enunciado original.

Este repositório é **independente** do projeto Ludora (outra plataforma, de jogos), mas reaproveita deliberadamente a mesma base de tooling/arquitetura já validada lá (NestJS + DDD + SWC + Jest + Docker), por ser uma configuração comprovada e não um experimento novo.

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

Este primeiro commit traz **só o esqueleto técnico**: tooling (lint, prettier, TypeScript, Jest/SWC), Docker e um endpoint `GET /` de hello-world (`AppController`). Nenhum bounded context de negócio existe ainda.

Ordem planejada dos próximos commits incrementais (não implementado ainda, só para orientar decisões de estrutura):
1. Kernel compartilhado (config via `@nestjs/config`, conexão MongoDB, segurança — helmet/CORS/throttler —, filtro de exceção global), no mesmo espírito do `src/shared`/`src/database`/`src/config` do Ludora.
2. Bounded context `auth` — registro/login de `lojista` e `comprador`, JWT.
3. Bounded context `ofertas` — CRUD de ofertas pelo lojista, endpoint público de listagem/filtro por status.
4. Bounded context `interesse` — comprador registra interesse, decremento de estoque.
5. Gateway WebSocket — notifica compradores conectados quando uma nova oferta é publicada.

Ao adicionar cada um desses, replicar a arquitetura DDD de 4 camadas descrita abaixo e atualizar a tabela de path aliases.

---

## Stack e Versões

| Item | Versão instalada em 2026-07-03 | Reconfirmar com |
|---|---|---|
| Node.js | 24.14.0 (LTS "Krypton") | `node -v` / `.nvmrc` |
| NestJS (`@nestjs/core` e demais `@nestjs/*`) | 11.1.27 | `npm view @nestjs/core version` |
| MongoDB (imagem Docker) | ainda não adicionado — entra com o `DatabaseModule` (ver [Estado atual](#estado-atual)) | `docker pull mongo:8.0` |
| Mongoose | ainda não adicionado | `npm view mongoose version` |
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

1. **`domain/`** — entidades e value objects. TypeScript puro, zero import de Nest/Mongoose/qualquer framework. Só regra de negócio (ex.: uma `Oferta` não pode ter estoque negativo).
2. **`application/`** — casos de uso (use cases) e as portas (interfaces) que eles precisam. Conhece `domain/`, nunca conhece `infrastructure/` diretamente — depende só das interfaces que ela mesma declara.
3. **`infrastructure/`** — implementação das portas declaradas em `application/`. É a única camada que sabe que o banco é MongoDB/Mongoose.
4. **`interface/`** — controllers HTTP, gateways WebSocket, DTOs de entrada/saída. Fala só com `application/` (use cases), nunca importa `infrastructure/` diretamente.

Nenhum bounded context existe ainda neste commit — quando o primeiro for criado (`auth`, provavelmente), esta seção deve passar a apontar pra ele como exemplo real, do mesmo jeito que o Ludora aponta pra `src/modules/games/`.

---

## Path Aliases

Zero imports relativos em todo o projeto (`src/` e `__tests__/`) — sempre via alias.

| Alias | Aponta para |
|---|---|
| `@app/*` | `src/*` (arquivos soltos na raiz: `main.ts`, `app.module.ts`, `app.controller.ts`, `types.ts`) |

Conforme bounded contexts forem criados (`auth`, `ofertas`, `interesse`, etc.), cada um ganha seu próprio alias (ex.: `@auth/*`, `@ofertas/*`) — um por contexto, não um `@modules/*` genérico, pelo mesmo motivo do Ludora: torna violação de fronteira entre contextos visível no import.

**Definido em dois lugares que precisam ficar sincronizados manualmente**: `tsconfig.json` (`compilerOptions.paths`) e `jest.config.ts` (`moduleNameMapper`). Ao adicionar/renomear/remover um alias, atualizar os dois.

**Resolução em runtime**: SWC não reescreve aliases como `tsc+webpack` fariam. Por isso os scripts `start`/`start:dev`/`start:debug`/`start:prod` carregam `tsconfig-paths/register` via `NODE_OPTIONS`, e `TS_NODE_BASE_URL=./dist` corrige a raiz de resolução (SWC compila `src/main.ts` → `dist/src/main.js`, preservando o caminho completo, não `dist/main.js`).

---

## Convenções de Código

- **`types.ts` sempre**: toda interface/type vive em um `types.ts` próprio da pasta — nunca inline em controller/service/entity/schema.
- **JSDoc curto**: interfaces, classes, módulos e métodos ganham um comentário `/** ... */` de uma linha explicando o propósito (não o "o quê", que o nome já diz).
- **Zero imports relativos**: sempre via alias, mesmo para arquivos vizinhos na mesma pasta.
- **Nunca `require()`, nunca `eslint-disable`**: sempre ES imports. Se o ESLint reclama, o código é ajustado para satisfazer a regra, não suprimido.
- **Nomenclatura de arquivo por papel**: `*.entity.ts` (domain), `*.use-case.ts` (application), `*.schema.ts` / `*.repository.ts` (infrastructure), `*.dto.ts` / `*.controller.ts` / `*.gateway.ts` (interface), `*.module.ts` (composição Nest).

---

## Testes

- **Localização**: `__tests__/` na raiz do projeto (não dentro de `src/`), espelhando a estrutura de `src/` 1:1.
- **Sufixo**: `.spec.ts`.
- **Framework**: Jest + `@swc/jest`.
- **Cabeçalho obrigatório "Cenários testados"**: todo `*.spec.ts` abre com um bloco JSDoc listando os cenários cobertos naquele arquivo (ver `__tests__/app.controller.spec.ts` para o formato). Esta lista deve ser atualizada manualmente sempre que um `describe`/`it` for adicionado, editado ou removido.
- **Idioma**: todo `describe`/`it` em pt-BR com acentuação.

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

`docker-compose.yml` só tem o serviço `api` por enquanto — o serviço `mongo` entra junto com o `DatabaseModule` (ver [Estado atual](#estado-atual)).

---

## Idioma

Documentação, comentários e nomes de `describe`/`it` em **pt-BR com acentuação**. Identificadores de código (variáveis, funções, classes) em inglês, como de costume.
