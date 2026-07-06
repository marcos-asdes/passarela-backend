<p align="center">
  <img src="docs/logo.png" alt="Passarela" width="360" />
</p>

API de uma plataforma onde **merchants** de um shopping publicam flash deals e **shoppers** acompanham em tempo real as promoções ativas, podendo registrar interesse. Projeto desenvolvido em resposta a um desafio técnico para vaga de desenvolvedor fullstack pleno.

## O Desafio

Construir em uma semana um MVP fullstack com dois papéis distintos (merchant e shopper), autenticação JWT, CRUD de ofertas com controle de estoque, notificações em tempo real via WebSocket e expiração automática de ofertas por job agendado.

## Arquitetura

Organização em **Domain-Driven Design** com três bounded contexts independentes:

- **auth** — registro e login para `merchant` e `shopper`, JWT com sessão revogável, hash de senha com `argon2id`
- **offers** — CRUD de ofertas pelo merchant, listagem pública com filtro por status, expiração automática via cron (`@nestjs/schedule`, a cada minuto)
- **interest** — shopper registra interesse, estoque decrementado atomicamente no Mongo (`findOneAndUpdate` condicional — evita oversell sob concorrência)

## Além do Desafio

Pontos implementados além do escopo mínimo do desafio:

### Controle de sessão

- Cada login grava uma sessão no Mongo; o JWT carrega o id dela (`jti`). Sessão revogada ou usuário excluído derruba o acesso já na próxima request, não só na expiração natural do token.
- `POST /auth/logout` revoga a sessão — o mesmo token vira `401` na hora.
- Tempo de vida configurável (`JWT_EXPIRES_IN`); sessões expiradas são limpas sozinhas por índice TTL do Mongo, sem cron manual.

### Camadas de segurança

- Hash de senha **argon2id** nos parâmetros mínimos recomendados pela OWASP, com defesa contra timing attack no login (comparação contra hash-dummy quando o e-mail não existe).
- JWT com algoritmo fixo (`HS256`) e payload validado globalmente (`ValidationPipe` com whitelist de campos).
- Rate limiting global, mais um limite extra restrito em `/auth/register` e `/auth/login`.
- Helmet, CORS restrito à origem configurada, filtro de exceção que nunca expõe stack trace ao cliente.
- Log estruturado com sanitização: senha, CPF, telefone e token de autenticação nunca aparecem no log.
- Validação de variáveis de ambiente no boot — a aplicação não sobe com config insegura ou faltante.

### Arquitetura e design patterns

- DDD com bounded contexts (`auth`/`offers`/`interest`), 4 camadas cada (domain/application/infrastructure/interface), dependência sempre numa direção.
- Inversão de dependência via injeção por token — troca de banco ou serviço não tocaria nenhum caso de uso.
- Comunicação entre contexts por evento de domínio, não por import direto — mantém os módulos independentes entre si.
- WebSocket (Socket.IO) por namespace + room — notificação dirigida a quem interessa, não broadcast geral.
- Expiração de ofertas por job agendado (`@nestjs/schedule`), fora do ciclo de request HTTP.
- Kernel compartilhado (`SharedModule`) centraliza logger, rate limit e filtro de exceção.

## Stack Tecnológica

| Camada | Tecnologias |
|---|---|
| Runtime | Node.js 24 LTS |
| Framework | NestJS 11 + SWC |
| Banco de dados | MongoDB via Mongoose |
| Autenticação | JWT (`@nestjs/jwt` / `passport-jwt`), hash `argon2id` |
| Segurança | Helmet, CORS, rate limiting (`@nestjs/throttler`) |
| Tempo real | WebSocket via Socket.IO (`@nestjs/websockets`) |
| Agendamento | `@nestjs/schedule` (cron de expiração de offers) |
| Documentação | Swagger / OpenAPI (`@nestjs/swagger`) |
| Testes | Jest + `@swc/jest` |
| Containerização | Docker + Docker Compose

## Documentação da API

A lista de rotas muda com frequência conforme o desafio evolui — em vez de manter (e desatualizar) uma
tabela aqui, a documentação sempre atual é o Swagger gerado a partir do código:

**[passarela-mplan-api.duckdns.org/docs](https://passarela-mplan-api.duckdns.org/docs)**

Rodando localmente, a mesma UI fica em `http://localhost:3000/docs` — todos os endpoints, schemas de
request/response e autenticação Bearer integrada.

## Como Rodar (Docker — preferencial)

```bash
cp .env.example .env
docker compose up --build
```

A API fica disponível em `http://localhost:3000`. Qualquer alteração em `src/` reinicia a aplicação automaticamente, sem rebuild manual da imagem.

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

Zero imports relativos — sempre via alias:

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
