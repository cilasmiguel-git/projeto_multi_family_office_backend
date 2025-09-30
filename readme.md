# 🧮 MFO Planner — Backend

**Fastify + Prisma + Zod + Jest**  
Backend do case **Multi Family Office (MFO)** para projeções patrimoniais, alocações, movimentações, seguros e clientes.

![Node](https://img.shields.io/badge/Node-20.x-339933?logo=node.js&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-4.x-000000?logo=fastify&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-ESM%2FNodeNext-3178C6?logo=typescript&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-29-99424F?logo=jest&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

> Swagger: `http://localhost:8080/docs`

---

## 🧭 Sumário

- [Arquitetura](#-arquitetura)
- [Como rodar](#-como-rodar)
- [Docker Compose](#-docker-compose)
- [Variáveis de ambiente](#-variáveis-de-ambiente)
- [Endpoints (resumo)](#-endpoints-resumo)
- [Regras de negócio](#-regras-de-negócio)
- [Paginação por cursor](#-paginação-por-cursor)
- [Testes \& Cobertura](#-testes--cobertura)
- [Scripts NPM](#-scripts-npm)
- [Commits \& Padrões](#-commits--padrões)
- [Roadmap](#-roadmap)

---

## 🏗 Arquitetura

```
src/
  core/
    http/app.ts            # instancia Fastify, Swagger, plugins
    plugins/{prisma,swagger}.ts
    schemas/common.ts      # enums/constantes compartilhadas
  modules/
    clients/               # CRUD + paginação cursor
    simulations/           # gerenciamento de simulações/versões
    projections/           # motor de projeção + endpoint
    allocations/           # ativos e timeline de registros
    movements/             # entradas/saídas (frequências)
    insurances/            # apólices e prêmios
  server.ts                # bootstrap do servidor
prisma/
  schema.prisma
  migrations/
tests/
  unit/                    # serviços puros
  e2e/                     # rotas Fastify com app.inject
```

- **Fastify 4** com `@fastify/swagger` e `@fastify/swagger-ui`
- **Prisma ORM** (PostgreSQL 15)
- **Zod** plugado via `fastify-type-provider-zod`
- **Jest** (unit + E2E) usando `ts-jest` em ESM/NodeNext

---

## 💻 Como rodar

> Requisitos: Node 20, Docker e Docker Compose.

```bash
# 1) Instalar dependências
npm install

# 2) Criar .env (base no .env.example)
# DATABASE_URL=postgresql://planner:plannerpw@localhost:5432/plannerdb
# PORT=8080

# 3) Subir o banco local
docker compose up -d db

# 4) Prisma
npm run prisma:generate
npm run prisma:migrate

# 5) Executar o servidor
npm run dev          # hot-reload
# ou
npm run build && npm start

# Swagger: http://localhost:8080/docs
```

---

## 🐳 Docker Compose

```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: planner
      POSTGRES_PASSWORD: plannerpw
      POSTGRES_DB: plannerdb
    volumes:
      - pg_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    depends_on:
      - db
    environment:
      DATABASE_URL: postgresql://planner:plannerpw@db:5432/plannerdb
      PORT: 8080
    ports:
      - "8080:8080"

volumes:
  pg_data:
```

> Este repositório cobre o **backend**. No case final, o Compose agrega **db + backend + frontend**.

---

## 🔐 Variáveis de ambiente

| Variável       | Descrição              | Exemplo                                             |
|----------------|------------------------|-----------------------------------------------------|
| `DATABASE_URL` | Conexão Postgres       | `postgresql://planner:plannerpw@db:5432/plannerdb` |
| `PORT`         | Porta do servidor HTTP | `8080`                                              |

---

## 📚 Endpoints (resumo)

> Documentação completa no Swagger **/docs**. Abaixo, um guia rápido.
<img width="3269" height="978" alt="image" src="https://github.com/user-attachments/assets/e7ffb7c5-1761-4147-a21d-e524d5257741" />

### Projections
- `POST /projections/`  
  **Body:**
  ```json
  {
    "simulationId": "uuid",
    "lifeStatus": "ALIVE" | "DEAD" | "INVALID",
    "baseRateReal": 0.04
  }
  ```
  **Retorna:** série ano a ano até 2060 (`financialAssets`, `realEstateAssets`, `totalAssets`, `totalWithoutInsurances`…)

### Clients
- `GET /clients?limit=10&cursor=<token>&q=<search>`
- `POST /clients`
- `GET /clients/:id`
- `PATCH /clients/:id`
- `DELETE /clients/:id`

### Allocations
- `GET /allocations/version/:versionId`
- `POST /allocations/`
- `PATCH /allocations/:id`
- `DELETE /allocations/:id`
- `GET /allocations/:id/records` **ou** `GET /allocations/:id/history`
- `POST /allocations/records` _(com `allocationId` no body)_
- `POST /allocations/:id/records` _(atalho por path param)_

### Movements
- `GET /movements/version/:versionId`
- `POST /movements/`
- `PATCH /movements/:id`
- `DELETE /movements/:id`

### Insurances
- `GET /insurances/version/:versionId`
- `POST /insurances/`
- `PATCH /insurances/:id`
- `DELETE /insurances/:id`

---

## 📐 Regras de negócio

**Projeção patrimonial**  
- Taxa real composta **padrão 4% a.a.** (parametrizável).  
- Ponto inicial: para cada alocação, usar **o último registro ≤ data de início**.  
- Status:
  - `ALIVE`: normal
  - `DEAD`: **income = 0** e **despesas / 2**
  - `INVALID`: income encerrado; despesas inalteradas
- **Total sem Seguros**: mesma simulação desconsiderando prêmios.

**Alocações**  
- **Nunca sobrescrever** registros; sempre criar `AllocationRecord` novo.  
- Histórico ordenado por `date ASC`.

**Movimentações**  
- Frequências `UNIQUE` | `MONTHLY` | `ANNUAL` e **encadeamento** de períodos.

**Seguros**  
- `monthlyPremium` entra como saída mensal dentro da vigência.

---

## 🔎 Paginação por cursor

Formato de resposta:

```json
{
  "items": [ ... ],
  "nextCursor": "opaque-token-or-null"
}
```

- Use `nextCursor` como parâmetro `cursor` para a página seguinte.
- O **cursor é um token opaco**: o cliente **não calcula**; apenas **repassa**.

---

## ✅ Testes & Cobertura

- **Unit**  
  - `projections`: crescimento com renda líquida, efeito de prêmios, status `DEAD/INVALID`  
  - `allocations`: criação de `AllocationRecord` SEM sobrescrever  
  - `movements`: encadeamento por períodos/frequências  
  - `insurances`: soma de prêmios apenas dentro da vigência  
  - `clients`: retorno `items` + `nextCursor`

- **E2E**  
  - `POST /projections`  
  - `GET /clients` e `POST /clients`  
  - `GET /allocations/:id/history`  
  - `POST /insurances`  
  - `GET /movements`

Rodar:

```bash
npm test
npm run test:cov
```

---

## 🧰 Scripts NPM

```json
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
```

---

## 🧾 Commits & Padrões

- `feat:` nova funcionalidade  
- `fix:` correção  
- `test:` testes  
- `docs:` documentação  
- `chore:` tooling/infra (sem impacto de runtime)

Ex.: `feat(projections): motor de projeção e endpoint POST`

---

## 🗺️ Roadmap

- [ ] Seed de dados
- [ ] Mais cenários de estresse no motor de projeção
- [ ] SonarCloud na org do GitHub
- [ ] AuthN/Z (futuro)
- [ ] Integração com o Frontend (Next 14)

---

### 📎 Exemplos rápidos (cURL)

```bash
# Projeção
curl -X POST http://localhost:8080/projections/ \
  -H "content-type: application/json" \
  -d '{"simulationId":"<uuid>","lifeStatus":"ALIVE","baseRateReal":0.04}'
```

```bash
# Criar registro de alocação
curl -X POST http://localhost:8080/allocations/records \
  -H "content-type: application/json" \
  -d '{"allocationId":"<uuid>","date":"2025-01-01","value":10000}'
```

---

## 📄 Licença

Uso educacional/avaliativo (case).

---

### 💬 Contato

Abra uma issue no repositório para dúvidas ou sugestões.
