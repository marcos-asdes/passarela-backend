# Passarela — backend

MVP de uma plataforma onde merchants de um shopping publicam flash deals e shoppers acompanham em tempo real as promoções ativas, podendo expressar interest. Projeto desenvolvido em resposta a um desafio técnico para vaga de desenvolvedor fullstack pleno.

Backend em NestJS 11, arquitetura DDD, containerizado com Docker (com fast refresh no desenvolvimento).

## Estado atual

Terceiro commit: bounded context **auth** — registro/login (seller/customer) com JWT, senha via argon2id, sessão controlada pelo banco (revogável) e documentação Swagger em `/docs`. Offers, interest e notificação em tempo real (WebSocket) serão adicionados em commits incrementais seguintes.

Decisões e trade-offs completos de arquitetura estão documentados em [`.claude/CLAUDE.md`](.claude/CLAUDE.md) — vale a leitura antes de propor mudanças estruturais.

## Stack Tecnológica

- **Node.js 24 LTS**
- **NestJS 11** com **SWC** (build rápido)
- **MongoDB** via **Mongoose**
- **Segurança**: helmet, CORS, rate limiting (`@nestjs/throttler`), JWT (`@nestjs/jwt`/`passport-jwt`), hash de senha `argon2id`
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
- `POST /auth/register` — cria conta (seller/customer), não emite token
- `POST /auth/login` — autentica e retorna o JWT
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

## Licença

MIT.
