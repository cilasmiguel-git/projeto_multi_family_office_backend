MFO Planner — Backend (Fastify + Prisma)

Backend do case “Multi Family Office Planner”. Implementa APIs para clientes, simulações, projeções patrimoniais, alocações, movimentações e seguros. Documentação interativa via Swagger.

📌 Stack

Node.js 20 + TypeScript (ESM/NodeNext)

Fastify 4 + @fastify/swagger + @fastify/swagger-ui

Zod v4 (schemas e validação)

Prisma ORM (PostgreSQL 15)

Jest + ts-jest + Supertest (unit e E2E)

ESLint (padronização)

Docker/Docker Compose

🧭 Sumário

Arquitetura & Pastas

Como rodar localmente

Docker Compose

Variáveis de ambiente

Endpoints principais

Regras de negócio & suposições

Paginação (cursor)

Testes & Cobertura

Scripts NPM

Convencional Commits

Roadmap

🏗️ Arquitetura & Pastas
src/
  core/
    http/
      app.ts          # instancia Fastify, Swagger, plugins, rotas
    plugins/
      prisma.ts       # prisma no app
      swagger.ts      # swagger + swagger-ui
    schemas/
      common.ts       # enums/consts comuns (MovementType, Frequency, etc.)
  modules/
    clients/
      controller.ts
      routes.ts
      schemas.ts
      service.ts
      index.ts
    simulations/
      ...
    projections/
      controller.ts
      routes.ts
      schemas.ts
      service.ts      # motor de projeção
      index.ts
    allocations/
      controller.ts
      routes.ts
      schemas.ts
      service.ts
      index.ts
    movements/
      ...
    insurances/
      ...
  server.ts            # bootstrap do servidor
prisma/
  schema.prisma
  migrations/          # migrações versionadas
tests/
  unit/                # testes unitários (serviços)
  e2e/                 # testes E2E (rotas)

💻 Como rodar localmente

Pré-requisitos: Node 20, Docker, Docker Compose.

Instalar deps

npm install


.env
Crie .env com base no .env.example:

DATABASE_URL=postgresql://planner:plannerpw@localhost:5432/plannerdb
PORT=8080


Subir Postgres (local)

docker compose up -d db


Prisma: gerar client e aplicar migrações

npm run prisma:generate
npm run prisma:migrate


Dev

npm run dev
# ou build + start
npm run build && npm start


Swagger UI

Abra: http://localhost:8080/docs

🐳 Docker Compose

O repositório já traz um docker-compose.yml. Exemplos úteis:

# subir apenas banco
docker compose up -d db

# subir tudo (db + backend)
docker compose up --build


No case final, o compose esperado tem db + backend + frontend.
Este repositório cobre o backend e já está pronto para conectar no serviço db.

🔐 Variáveis de ambiente
Nome	Descrição	Exemplo
DATABASE_URL	string de conexão Postgres	postgresql://planner:plannerpw@db:5432/plannerdb
PORT	porta da API	8080
📚 Endpoints principais

Todos os endpoints têm schemas Zod e aparecem no /docs (Swagger).

Projections

POST /projections/
Body:

{
  "simulationId": "uuid",
  "lifeStatus": "ALIVE" | "DEAD" | "INVALID",
  "baseRateReal": 0.04
}


Retorna projeção ano a ano até 2060, com linhas:

financialAssets, realEstateAssets, totalAssets, totalWithoutInsurances, etc.

Clients

GET /clients?limit=10&cursor=<opaque>&q=<search>

POST /clients (cria)

GET /clients/:id

PATCH /clients/:id

DELETE /clients/:id

Allocations

GET /allocations/version/:versionId (lista ativos da versão)

POST /allocations/ (cria alocação)

PATCH /allocations/:id

DELETE /allocations/:id

GET /allocations/:id/records ou /allocations/:id/history (timeline completa)

POST /allocations/records (cria registro com { allocationId, date, value })

POST /allocations/:id/records (atalho: cria registro para uma alocação específica)

Movements

GET /movements/version/:versionId (lista por versão)

POST /movements/ (cria)

PATCH /movements/:id

DELETE /movements/:id

Insurances

GET /insurances/version/:versionId

POST /insurances/

PATCH /insurances/:id

DELETE /insurances/:id

📐 Regras de negócio & suposições

Projeção patrimonial

Taxa real composta padrão 4% a.a. (configurável no payload).

Projeta do ano da simulação até 2060.

Ponto inicial: para cada alocação, considera o último registro ≤ data de início.

Status de vida:

DEAD: zera entradas e divide despesas por 2.

INVALID: apenas encerra entradas; despesas inalteradas.

ALIVE: fluxo normal.

Linha “Total sem Seguros”: mesma simulação, desconsiderando prêmios iniciais de seguro.

Alocações

Nunca sobrescrever registros; criar novo AllocationRecord na data informada.

GET /:id/history retorna a timeline ordenada por data (asc).

Movimentações

CRUD completo; frequências UNIQUE, MONTHLY, ANNUAL.

Suporte a encadeamento (ex.: salário 2025–2035 e outro 2035–2060).

Seguros

Registro com name, type (LIFE|DISABILITY), startDate, durationMonths, monthlyPremium, insuredAmount.

Prêmios entram como saída mensal dentro da vigência.

🔎 Paginação (cursor)

Endpoints de listagem usam cursor-based pagination:

Request: GET /clients?limit=10&cursor=<token opaco>

Response:

{
  "items": [ ... ],
  "nextCursor": "opaque-token-or-null"
}


Para pegar a próxima página, envie cursor=nextCursor.

O cursor é um token opaco (não é “página 2”). Você nunca “inventa” um cursor: sempre usa o que veio da resposta anterior.

✅ Testes & Cobertura

Unit: foca em serviços (ex.: generateProjection, regras de prêmios, encadeamento de movimentos, criação de allocation records).

E2E: valida rotas (ex.: POST /projections, GET /clients, GET /allocations/:id/history).

Rodar:

npm test
npm run test:cov    # com cobertura


Config:

Jest em ESM com ts-jest (ver jest.config.cjs e tsconfig.jest.json).

Pastas: tests/unit e tests/e2e.

🧰 Scripts NPM
{
  "dev": "tsx watch src/server.ts",
  "build": "tsc -p tsconfig.json",
  "start": "node dist/server.js",
  "lint": "eslint \"src/**/*.{ts,tsx}\"",
  "test": "jest -c jest.config.cjs",
  "test:cov": "jest -c jest.config.cjs --coverage",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate deploy || prisma migrate dev --name init",
  "prisma:studio": "prisma studio"
}

🧾 Convencional Commits

feat: nova funcionalidade

fix: correção

test: testes

docs: documentação

chore: tarefas sem impacto de runtime (lockfile, tooling)

Ex.: feat(projections): motor de projeção e endpoint POST

🗺️ Roadmap

 Seed de dados

 Mais cenários de projeção (estresse)

 Autenticação/autorização (futuro)

 Integração com SonarCloud (organization do GitHub)

 Frontend (Next.js 14 + Shadcn UI + TanStack Query + RHF + Zod)

📄 Licença

Uso educacional/avaliativo (case).

💬 Contato

Dúvidas/sugestões: abra uma issue.

Exemplos rápidos (cURL)

Criar apólice de seguro:

curl -X POST http://localhost:8080/insurances/ \
  -H "content-type: application/json" \
  -d '{
    "simulationVersionId":"<uuid-da-versao>",
    "name":"Seguro de Vida",
    "type":"LIFE",
    "startDate":"2025-01-01",
    "durationMonths":120,
    "monthlyPremium":100,
    "insuredAmount":100000
  }'


Gerar projeção:

curl -X POST http://localhost:8080/projections/ \
  -H "content-type: application/json" \
  -d '{"simulationId":"<uuid>","lifeStatus":"ALIVE","baseRateReal":0.04}'

Como salvar e enviar este README

No PowerShell, faça:

# Se já existe um arquivo "readme", renomeie:
git mv readme README.md

# (se não existir, crie o README.md e cole o conteúdo acima)

git add README.md
git commit -m "docs(README): visão geral, arquitetura, endpoints, setup e testes"
git push