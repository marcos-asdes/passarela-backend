# Passarela — backend

MVP de uma plataforma onde merchants de um shopping publicam flash deals e shoppers acompanham em tempo real as promoções ativas, podendo expressar interest. Projeto desenvolvido em resposta a um desafio técnico para vaga de desenvolvedor fullstack pleno.

Backend em NestJS 11, arquitetura DDD, containerizado com Docker (com fast refresh no desenvolvimento).

## Estado atual

Segundo commit: kernel compartilhado — configuração validada (`@nestjs/config` + `class-validator`), conexão MongoDB (`@nestjs/mongoose`), segurança (helmet, CORS, rate limiting) e filtro de exceção global. Autenticação, offers, interest e notificação em tempo real (WebSocket) serão adicionados em commits incrementais seguintes.

Decisões e trade-offs completos de arquitetura estão documentados em [`.claude/CLAUDE.md`](.claude/CLAUDE.md) — vale a leitura antes de propor mudanças estruturais.

## Stack Tecnológica

- **Node.js 24 LTS**
- **NestJS 11** com **SWC** (build rápido)
- **MongoDB** via **Mongoose**
- **Segurança**: helmet, CORS, rate limiting (`@nestjs/throttler`)
- **Jest** + `@swc/jest` para testes
- **Docker** / Docker Compose (com fast refresh em desenvolvimento)

## Como Rodar (Docker — preferencial)

```bash
cp .env.example .env
docker compose up --build
```

A API fica disponível em `http://localhost:3000` (porta do host mapeada em `docker-compose.yml` — ajuste se `3000` estiver ocupada na sua máquina):

- `GET /` — confirma que a API está no ar (hello-world)

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

- `make up` / `make up-build`
- `make down`
- `make logs`
- `make ps`
- `make shell`
- `make test`
- `make lint`
- `make prune`

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

Precisa de um MongoDB acessível na URI configurada em `MONGODB_URI` (`.env`) — sem Docker, aponte pra uma instância local ou remota.

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

## Licença

MIT.
