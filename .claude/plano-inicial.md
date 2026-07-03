# Passarela — backend, primeiro commit (infra básica)

## Contexto

Desafio técnico de vaga (fullstack pleno) pede um MVP: plataforma onde lojistas de shopping publicam ofertas relâmpago e compradores acompanham em tempo real, registrando interesse (WebSocket, JWT, estoque decrementando). Parte da stack/arquitetura já existe validada no projeto Ludora (NestJS 11 + DDD 4 camadas + Mongo + SWC + Jest), mas este é um **projeto novo e independente** — repositório próprio no GitHub, não um módulo do Ludora.

Decisões já fechadas com o usuário:
- **Nome do projeto**: **Passarela**.
- **Banco de dados**: MongoDB — reaproveita o padrão `DatabaseModule`/Mongoose já validado no Ludora.
- **Layout de pastas**: pasta-mãe sem git próprio, com `backend/` e `frontend/` como subpastas, cada uma seu próprio repositório git (mapeando pra dois repos GitHub independentes, `passarela-backend` e `passarela-frontend`). Isso vira um workspace multi-root no VS Code.
- **Escopo desta sessão**: só o **backend**, e só o **primeiro commit** — infra básica (readme, `.claude`, `package.json`, lint, prettier, Docker) + `src/` com uma declaração hello-world mínima. Frontend fica pra depois. Regras de negócio (auth, ofertas, interesse, WebSocket) entram em commits incrementais seguintes, não agora.

Ambiente confirmado: Node `v24.14.0` / npm `11.11.0` (bate exatamente com `.nvmrc` do Ludora — sem drift). `gh` CLI não está instalado nesta máquina — criação de repositório remoto no GitHub e push **não** fazem parte desta sessão; ficam pra um passo seguinte, explicitamente confirmado com o usuário na hora (envolve ação visível a terceiros).

## Estrutura de pastas a criar

```
c:\Users\marco\projects\passarela\        # pasta-mãe, SEM git próprio
└── backend\                              # git init aqui — vira repo "passarela-backend"
    ├── .claude/CLAUDE.md
    ├── src/
    │   ├── main.ts
    │   ├── app.module.ts
    │   └── app.controller.ts
    ├── __tests__/
    │   └── app.controller.spec.ts
    ├── package.json, tsconfig.json, tsconfig.build.json, nest-cli.json
    ├── jest.config.ts, .swcrc, eslint.config.mjs
    ├── .prettierrc, .prettierignore, .editorconfig, .gitattributes, .gitignore
    ├── .nvmrc, .env.example
    ├── Dockerfile, docker-compose.yml, .dockerignore
    └── README.md
(frontend/ não é criado nesta sessão)
```

## O que replicar do Ludora vs. o que NÃO entra ainda

**Replicar (tooling idêntico, adaptado só em nome/descrição)**: `tsconfig.json`, `tsconfig.build.json`, `nest-cli.json`, `jest.config.ts`, `.swcrc`, `eslint.config.mjs`, `.prettierrc`, `.prettierignore`, `.editorconfig` (CRLF), `.gitattributes` (CRLF), `.gitignore`, `.nvmrc` (`24.14.0`), `.dockerignore`, `Dockerfile` (3 estágios: development/build/production, mesmo gotcha `npm install` vs `npm ci` pro chokidar no estágio dev).

**NÃO entra neste commit** (fica pra quando a feature real precisar, evita dependência morta/código sem uso):
- `@nestjs/mongoose` + `mongoose` + `DatabaseModule` — só quando o módulo de auth/ofertas precisar persistir algo.
- `helmet`/`compression`/`@nestjs/throttler`/`AllExceptionsFilter`/`ConfigModule` (kernel de segurança do Ludora) — vira um commit incremental próprio, não hello-world.
- `commitlint.config.json` — no Ludora existe mas está órfão (não tem husky nem a dependência instalada); não replicar esse gap.
- `docker-compose.yml` só terá o serviço `api` por enquanto (sem `mongo`) — Mongo entra no compose junto com o `DatabaseModule`.

Isso mantém o primeiro commit literalmente "infra + hello world", como pedido, e cada peça (segurança, banco, auth) vira seu próprio commit incremental depois — igual ao espírito do Ludora.

## `src/` — hello world mínimo

- `main.ts`: `NestFactory.create(AppModule)` + `app.listen(process.env.PORT ?? 3000)`. Sem prefixo `/api`, sem versionamento, sem `ValidationPipe`, sem Swagger — isso tudo é kernel, entra depois.
- `app.module.ts`: `@Module({ controllers: [AppController] })`, sem imports ainda.
- `app.controller.ts`: `@Controller()` com `@Get()` retornando algo como `{ message: 'Hello World', service: 'passarela-backend' }`. JSDoc de uma linha, no padrão do Ludora.
- `__tests__/app.controller.spec.ts`: um spec simples testando o retorno do controller, com o cabeçalho JSDoc "Cenários testados" (convenção obrigatória de teste do Ludora, mesmo em projeto novo).

## `package.json`

- `name`: `passarela-backend`, `private` **não** setado (ou `false`) e `license: MIT` — diferente do Ludora (`UNLICENSED`/`private`), porque o desafio pede código público no GitHub, com README "como projeto open source".
- `engines.node`: `>=24`.
- Scripts idênticos aos do Ludora (`build`, `start`, `start:dev`, `start:debug`, `start:prod`, `test`, `test:watch`, `test:cov`, `format`, `format:check`, `lint`) — mesma necessidade de `NODE_OPTIONS=-r tsconfig-paths/register` + `TS_NODE_BASE_URL=./dist` (SWC não reescreve aliases, gotcha documentado no Ludora).
- Dependências: só o núcleo mínimo pra rodar o hello world — `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `reflect-metadata`, `rxjs`. Dev deps: `@nestjs/cli`, `@nestjs/schematics`, `@nestjs/testing`, `@swc/cli`, `@swc/core`, `@swc/jest`, `eslint` (+ `@eslint/js`, `eslint-config-prettier`, `eslint-plugin-prettier`, `typescript-eslint`), `jest`, `prettier`, `typescript`, `tsconfig-paths`, `cross-env`, `chokidar`, `ts-node`, `source-map-support`, tipos (`@types/node`, `@types/jest`, `@types/express`).
- Versões: **não** copiar os números fixos do Ludora — instalar via `npm install <pacote>@latest` em cada pacote (regra operacional do próprio Ludora) e deixar o `package-lock.json` registrar o que resolver de fato. Node/npm já batem exatamente com o Ludora, então na prática devem sair próximas, mas o processo é o correto (verificar, não colar).

## `.claude/CLAUDE.md` (novo, adaptado)

Documento próprio do Passarela — não uma cópia do Ludora. Deve cobrir, no mesmo estilo (pt-BR, seções, tabelas):
- Contexto do projeto (desafio técnico, marketplace de ofertas relâmpago em shopping, dois perfis: lojista/comprador).
- Stack e versões (mesma tabela formato Ludora, mas registrando as versões que forem realmente resolvidas nesta instalação).
- Arquitetura DDD de 4 camadas (mesmo modelo `domain/application/infrastructure/interface`), mencionando que os bounded contexts (auth, ofertas, interesse, notificações) ainda serão criados incrementalmente — este commit não tem nenhum ainda.
- Path aliases: por ora só `@app/*` → `src/*` (tabela cresce conforme módulos forem entrando; mesmo aviso do Ludora sobre manter `tsconfig.json` e `jest.config.ts` sincronizados manualmente).
- Convenção de testes (`__tests__/` espelhando `src/`, sufixo `.spec.ts`, cabeçalho "Cenários testados" obrigatório).
- Docker: desenvolvimento preferencial via `docker compose up --build`, mas deve funcionar fora do Docker também (`npm install` + `npm run start:dev` com Mongo/serviços externos acessíveis, quando existirem).
- Idioma: pt-BR em docs/comentários/testes, identificadores em inglês — igual ao Ludora.

## `README.md`

Adaptado da estrutura do Ludora, mas contextualizado pro desafio: o que é o Passarela, stack, como rodar (Docker e local), como testar, estado atual explícito ("este commit traz só o esqueleto técnico — infra, lint, Docker e um endpoint hello-world; funcionalidades do desafio entram nos próximos commits"). Já deixar claro que é pensado pra avaliação de terceiro (linguagem clara, sem giria/assumir contexto).

## `docker-compose.yml` / `Dockerfile` / `.env.example`

- `docker-compose.yml`: só serviço `api` (build stage `development`, bind mount de `src/`, `__tests__/` e arquivos de config, volume nomeado pra `node_modules`, `CHOKIDAR_USEPOLLING`/`WATCHPACK_POLLING`, network `passarela-network`). Sem `mongo` ainda.
- `Dockerfile`: mesmo padrão 3 estágios do Ludora (development/build/production, `USER node` em produção).
- `.env.example`: só `NODE_ENV` e `PORT` por enquanto (o resto entra junto com `ConfigModule`/Mongo/JWT nos próximos commits).

## Passos de execução (ordem)

1. Criar `c:\Users\marco\projects\passarela\backend\` (com `mkdir -p`).
2. `git init` dentro de `backend/`.
3. Escrever todos os arquivos de config/tooling listados acima.
4. `npm install` (resolve versões reais, gera `package-lock.json`).
5. Escrever `src/` (hello world) e `__tests__/` (spec).
6. Rodar localmente: `npm run lint`, `npm run format:check`, `npm test`, `npm run start:dev` (checar hello world responde).
7. Rodar via Docker: `docker compose up --build`, checar mesmo endpoint responde no container.
8. `git add` + primeiro commit (mensagem convencional, ex.: `chore: infra básica do backend (Nest + Docker + hello world)`).
9. **Não** criar repositório remoto nem dar push nesta sessão — isso é confirmado à parte quando o usuário pedir (e precisa de `gh` instalado ou criação manual via GitHub web, já que a CLI não está disponível nesta máquina).

## Verificação

- `npm test` passa (spec do `AppController`).
- `npm run lint` e `npm run format:check` sem erros.
- `npm run start:dev` local: `curl http://localhost:3000/` retorna o JSON hello-world.
- `docker compose up --build`: mesmo `curl` funciona apontando pro container; editar `src/app.controller.ts` e ver fast-refresh sem rebuild manual.
- `git log` mostra um único commit limpo, `git status` limpo depois.
