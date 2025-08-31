# App de Cupcakes — Monorepo (API + Web)

Stack:
- API: Node.js + Express + TypeScript + Prisma + PostgreSQL + JWT + Zod
- Web: React + Vite + TypeScript + Tailwind + Zustand + React Router
- Testes: Jest/Supertest (API) + Vitest/RTL (Web)
- Padronização: ESLint + Prettier + Husky + lint-staged
- Docs: Swagger (stub)
- Infra Dev: Docker Compose (Postgres)

## Requisitos
- Node 18+
- npm
- Docker + Docker Compose

## Como rodar (dev)

1) Subir banco:
   docker compose up -d

2) API:
   cd api
   cp .env.example .env
   npx prisma generate
   npm run prisma:migrate
   npm run seed
   npm run dev
   API em http://localhost:4000/api
   Swagger em http://localhost:4000/api/docs

3) Web:
   cd web
   cp .env.example .env
   npm run dev
   Front em http://localhost:5173

## Scripts úteis
- API:
  - npm run dev | build | start | test | lint | format
  - npm run prisma:migrate | prisma:studio | seed
- Web:
  - npm run dev | build | preview | test | lint | format

## Estrutura
- api/ (backend)
- web/ (frontend)
- docker-compose.yml (Postgres)

