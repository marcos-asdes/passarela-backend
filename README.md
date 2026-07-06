# Passarela — backend

MVP de uma plataforma onde merchants de um shopping publicam flash deals e shoppers acompanham em tempo real as promoções ativas, podendo expressar interest. Projeto desenvolvido em resposta a um desafio técnico para vaga de desenvolvedor fullstack pleno.

Backend em NestJS 11, arquitetura DDD, containerizado com Docker (com fast refresh no desenvolvimento).

## Estado atual

MVP completo do desafio: bounded context **auth** (registro/login `merchant`/`shopper` com JWT, senha via argon2id, sessão controlada pelo banco/revogável), **offers** (CRUD pelo merchant + listagem pública com filtro por status) e **interest** (shopper registra interesse, estoque decrementa atomicamente), com **notificação em tempo real via WebSocket** (Socket.IO) quando uma offer nova é publicada e um **job agendado** que expira offers vencidas. Documentação Swagger em `/docs`.

Decisões e trade-offs completos de arquitetura estão documentados em [`.claude/CLAUDE.md`](.claude/CLAUDE.md) e nos planos em [`.claude/plans/`](.claude/plans/) — vale a leitura antes de propor mudanças estruturais.

### Decisões técnicas e trade-offs assumidos

- **Estoque decrementado atomicamente** (`findOneAndUpdate` condicional no Mongo, não um read-then-write em memória) — evita oversell sob concorrência (dois shoppers registrando interest ao mesmo tempo na última unidade).
- **Sem transação Mongo real** no registro de interest: o fluxo insere o registro de interest primeiro (o índice único `{offerId, shopperId}` garante "1 por shopper/offer" mesmo sob corrida) e, se o decremento de estoque falhar depois, desfaz esse insert manualmente. Uma transação multi-documento de verdade exigiria um replica set, que o `docker-compose` deste desafio não provisiona — trade-off consciente de escopo/tempo, não descuido.
- **Fronteira deliberada entre `offers` e `interest`**: os dois bounded contexts só se comunicam via dois adapters de infraestrutura que leem o *schema* um do outro (nunca lógica de negócio/use case), evitando um ciclo de módulos Nest. Detalhado no `CLAUDE.md`.
- **WebSocket sem autenticação no handshake**: o namespace `/offers` faz broadcast público pra qualquer socket conectado. Suficiente pro escopo do desafio (o evento não carrega dado sensível); produção exigiria JWT no handshake e salas por shopper.
- **Expiração de offers via cron** (`@nestjs/schedule`, a cada minuto) em vez de computar "expirada" só na leitura — persiste a transição no banco, então o dashboard/feed refletem o status real mesmo sem uma requisição de leitura recente.

## Stack Tecnológica

- **Node.js 24 LTS**
- **NestJS 11** com **SWC** (build rápido)
- **MongoDB** via **Mongoose**
- **Segurança**: helmet, CORS, rate limiting (`@nestjs/throttler`), JWT (`@nestjs/jwt`/`passport-jwt`), hash de senha `argon2id`
- **Tempo real**: WebSocket via Socket.IO (`@nestjs/websockets`/`@nestjs/platform-socket.io`)
- **Job agendado**: `@nestjs/schedule` (expiração de offers)
- **Documentação**: Swagger/OpenAPI (`@nestjs/swagger`) em `/docs`
- **Jest** + `@swc/jest` para testes
- **Docker** / Docker Compose (com fast refresh em desenvolvimento)

## Como Rodar (Docker — preferencial)

```bash
cp .env.example .env
docker compose up --build
```

A API fica disponível em `http://localhost:3000` (porta do host mapeada em `docker-compose.yml` — ajuste se `3000` estiver ocupada na sua máquina):

- `GET /` — confirma que a API está no ar (hello-world)
- `POST /auth/register` — cria conta (`merchant`/`shopper`), não emite token
- `POST /auth/login` — autentica e retorna o JWT
- `POST /offers` — merchant publica uma offer (autenticado, dispara `offer:created` no WebSocket)
- `PATCH /offers/:id` — merchant edita uma offer própria (só enquanto `Active`)
- `POST /offers/:id/close` — merchant encerra uma offer própria manualmente
- `GET /offers/mine` — dashboard do merchant, offers próprias com contagem de interest
- `GET /offers?status=` — feed público, sem autenticação (default só `active`)
- `POST /interest` — shopper registra interest numa offer (autenticado, decrementa estoque)
- **WebSocket** `ws://localhost:3000/offers` (namespace Socket.IO) — evento `offer:created`
- `GET /docs` — documentação Swagger/OpenAPI interativa

Qualquer alteração em `src/` reinicia a aplicação automaticamente, sem rebuild manual da imagem.

## Atalhos Docker (Makefile)

Para agilizar o dia a dia, existe um `Makefile` com os comandos principais:

```bash
make help
make up
make logs
make down
```

Comandos mais usados:

- `make up` / `make up-build` — sobe em background (sem logs; use `make logs` à parte)
- `make start` / `make start-build` — sobe em primeiro plano, com logs ao vivo (Ctrl+C derruba)
- `make build` — builda as imagens sem subir
- `make down` / `make restart`
- `make logs`
- `make ps`
- `make shell`
- `make test`
- `make lint`
- `make clean` — down com remoção de containers órfãos
- `make prune` — clean + remove volumes (apaga dados do Mongo)
- `make rebuild` — rebuild sem cache

Também da para escolher o servico nos logs:

```bash
make logs SERVICE=api
```

Se você estiver no Windows sem `make`, use os equivalentes com Docker Compose (ex.: `docker compose up --build`, `docker compose logs -f api`, `docker compose down`).

## Como Rodar (local, sem Docker)

```bash
cp .env.example .env
npm install
npm run start:dev
```

Precisa de um MongoDB acessível na URI configurada em `MONGODB_URI` (`.env`). O valor certo muda conforme onde a API e o Mongo estão rodando — o hostname `mongo` só resolve dentro da rede do `docker-compose`, e a porta do Mongo dockerizado é exposta no host como `27019` (não `27017`), pra não colidir com outro Mongo local:

| Onde a API roda | Onde o Mongo roda | `MONGODB_URI` |
|---|---|---|
| Dentro do Docker | Dentro do Docker | `mongodb://usuario:senha@mongo:27017/passarela?authSource=admin` (valor padrão do `.env`) |
| Fora do Docker (`npm run start:dev`) | Dentro do Docker | `mongodb://usuario:senha@localhost:27019/passarela?authSource=admin` |
| Fora do Docker | Fora do Docker (Mongo local instalado na máquina) | `mongodb://localhost:27017/passarela` (sem credenciais, se o Mongo local não tiver auth habilitada) |

Pra rodar fora do Docker apontando pra um Mongo diferente do que está no `.env`, sobrescreva a variável no shell antes de rodar — `@nestjs/config` nunca sobrescreve uma env var já setada no processo com o valor do `.env`:

```powershell
$env:MONGODB_URI="mongodb://localhost:27017/passarela"
npm run start:dev
```

## Testes

```bash
npm test          # roda toda a suíte
npm run test:cov  # com cobertura
```

Testes ficam em [`__tests__/`](__tests__/), espelhando a estrutura de `src/` a partir da raiz do projeto.

## Lint e formatação

```bash
npm run lint
npm run format:check
```

## Path Aliases

Zero imports relativos — sempre via alias. Tabela completa (cresce conforme novos módulos entram) em [`.claude/CLAUDE.md`](.claude/CLAUDE.md).

| Alias | Aponta para |
|---|---|
| `@app/*` | `src/*` |
| `@config`, `@config/*` | `src/config` |
| `@database`, `@database/*` | `src/database` |
| `@shared`, `@shared/*` | `src/shared` |
| `@auth/*` | `src/modules/auth/*` |
| `@offers/*` | `src/modules/offers/*` |
| `@interest/*` | `src/modules/interest/*` |

## Licença

MIT.
