COMPOSE ?= docker compose
SERVICE ?= api

.PHONY: help up up-build build down restart logs ps shell test lint clean prune rebuild

help:
	@echo "Comandos disponiveis:"
	@echo "  make up         - sobe os containers em background"
	@echo "  make up-build   - sobe os containers com build"
	@echo "  make build      - builda as imagens"
	@echo "  make down       - derruba os containers"
	@echo "  make restart    - reinicia os containers"
	@echo "  make logs       - acompanha logs do servico (SERVICE=api)"
	@echo "  make ps         - lista status dos containers"
	@echo "  make shell      - abre shell no container da API"
	@echo "  make test       - roda testes dentro do container da API"
	@echo "  make lint       - roda lint dentro do container da API"
	@echo "  make clean      - down com remocao de orfaos"
	@echo "  make prune      - clean + remocao de volumes"
	@echo "  make rebuild    - rebuild sem cache do servico"

up:
	$(COMPOSE) up -d

up-build:
	$(COMPOSE) up --build -d

build:
	$(COMPOSE) build

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) down
	$(COMPOSE) up -d

logs:
	$(COMPOSE) logs -f $(SERVICE)

ps:
	$(COMPOSE) ps

shell:
	$(COMPOSE) exec $(SERVICE) sh

test:
	$(COMPOSE) exec $(SERVICE) npm test

lint:
	$(COMPOSE) exec $(SERVICE) npm run lint

clean:
	$(COMPOSE) down --remove-orphans

prune:
	$(COMPOSE) down -v --remove-orphans

rebuild:
	$(COMPOSE) build --no-cache $(SERVICE)