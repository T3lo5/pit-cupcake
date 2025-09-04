# 🚀 Guia de Deploy Gratuito - Cupcakes Project

Este guia apresenta as melhores opções gratuitas para fazer deploy do projeto Cupcakes, que é um monorepo com:

- **Backend**: Node.js + Express + TypeScript + Prisma + PostgreSQL
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Banco de dados**: PostgreSQL

## 📋 Índice

- [Opções Recomendadas](#-opções-recomendadas)
- [Configuração por Plataforma](#-configuração-por-plataforma)
- [Preparação do Projeto](#-preparação-do-projeto)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Scripts de Build](#-scripts-de-build)

## 🎯 Opções Recomendadas

### 1. Railway ⭐ (Mais Recomendado)

**Por que escolher:**
- ✅ Suporte nativo a monorepos
- ✅ PostgreSQL gratuito incluído
- ✅ Deploy automático via Git
- ✅ $5 de crédito mensal gratuito
- ✅ Configuração mínima

**Limites:**
- $5/mês de crédito gratuito
- Suficiente para projetos pequenos/médios

**Como usar:**
1. Acesse [railway.app](https://railway.app)
2. Conecte seu repositório GitHub
3. Railway detecta automaticamente as configurações
4. Configure as variáveis de ambiente
5. Deploy automático!

### 2. Render

**Características:**
- ✅ Frontend gratuito (sites estáticos)
- ✅ Backend: 750 horas gratuitas/mês
- ✅ PostgreSQL gratuito por 90 dias
- ✅ SSL automático
- ✅ Builds automáticos

**Limites:**
- Backend hiberna após 15min de inatividade
- PostgreSQL pago após 90 dias ($7/mês)

### 3. Vercel + Railway/Render

**Combinação ideal:**
- **Vercel**: Frontend (React/Vite) - gratuito ilimitado
- **Railway/Render**: Backend + Database

**Vantagens:**
- ✅ Performance excepcional para frontend
- ✅ CDN global
- ✅ Previews automáticos de PR

### 4. Netlify + Supabase

**Para quem quer inovar:**
- **Netlify**: Frontend gratuito
- **Supabase**: PostgreSQL + API + Auth gratuito

**Vantagens:**
- ✅ Supabase oferece auth pronto
- ✅ Real-time database
- ✅ 500MB gratuitos no Supabase

### 5. Fly.io

**Para usuários Docker:**
- ✅ Suporte completo a Docker
- ✅ PostgreSQL gratuito
- ✅ 3 VMs pequenas gratuitas
- ✅ Deploy global

## 🛠 Configuração por Plataforma

### Railway (Recomendado)

1. **Conectar repositório:**
   ```bash
   # No Railway dashboard
   New Project → Deploy from GitHub repo
   ```

2. **Configuração automática:**
   - Railway detecta `package.json` em `/api` e `/web`
   - Cria serviços separados automaticamente
   - Provisiona PostgreSQL automaticamente

3. **Variáveis necessárias:**
   ```env
   # Para o serviço API
   DATABASE_URL=postgresql://...  # Gerado automaticamente
   JWT_SECRET=seu_jwt_secret_aqui
   NODE_ENV=production
   PORT=3000
   
   # Para o serviço Web
   VITE_API_URL=https://sua-api.railway.app
   ```

### Render

1. **Backend (Web Service):**
   ```yaml
   # render.yaml (opcional)
   services:
     - type: web
       name: cupcakes-api
       env: node
       buildCommand: cd api && npm install && npm run build
       startCommand: cd api && npm start
       rootDir: .
   ```

2. **Frontend (Static Site):**
   ```bash
   Build Command: cd web && npm install && npm run build
   Publish Directory: web/dist
   ```

### Vercel

1. **Configuração do frontend:**
   ```json
   // vercel.json
   {
     "builds": [
       {
         "src": "web/package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist"
         }
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/web/$1"
       }
     ]
   }
   ```

## 🔧 Preparação do Projeto

### 1. Scripts de Build

Adicione ao `package.json` raiz:

```json
{
  "scripts": {
    "build": "npm run build:api && npm run build:web",
    "build:api": "cd api && npm install && npm run build",
    "build:web": "cd web && npm install && npm run build",
    "start": "cd api && npm start",
    "start:web": "cd web && npm run preview"
  }
}
```

### 2. Dockerfile (opcional para Fly.io)

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY api/package*.json ./api/
COPY web/package*.json ./web/

# Install dependencies
RUN npm install
RUN cd api && npm install
RUN cd web && npm install

# Copy source code
COPY . .

# Build applications
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 3. Configuração do Prisma

Adicione ao `api/package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma generate && tsc",
    "start": "prisma migrate deploy && node dist/server.js"
  }
}
```

## 🔐 Variáveis de Ambiente

### Backend (API)

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro_aqui

# App
NODE_ENV=production
PORT=3000

# CORS (se necessário)
FRONTEND_URL=https://seu-frontend.vercel.app
```

### Frontend (Web)

```env
# API URL
VITE_API_URL=https://sua-api.railway.app

# Outras configurações se necessário
VITE_APP_NAME=Cupcakes
```

## 📝 Checklist de Deploy

### Antes do Deploy:

- [ ] Testar build local: `npm run build`
- [ ] Verificar se todos os testes passam: `npm test`
- [ ] Configurar variáveis de ambiente
- [ ] Verificar se o Prisma está configurado corretamente
- [ ] Testar conexão com banco local

### Após o Deploy:

- [ ] Verificar se a API está respondendo
- [ ] Testar endpoints principais
- [ ] Verificar se o frontend carrega
- [ ] Testar integração frontend-backend
- [ ] Verificar logs de erro

## 🆘 Troubleshooting

### Problemas Comuns:

1. **Erro de build do Prisma:**
   ```bash
   # Adicione ao script de build
   "build": "prisma generate && tsc"
   ```

2. **CORS Error:**
   ```javascript
   // No backend, configure CORS
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:5173'
   }));
   ```

3. **Database Connection:**
   ```javascript
   // Verifique se DATABASE_URL está configurada
   console.log('Database URL:', process.env.DATABASE_URL ? 'Configured' : 'Missing');
   ```

## 🎉 Próximos Passos

1. **Escolha sua plataforma preferida**
2. **Configure as variáveis de ambiente**
3. **Faça o primeiro deploy**
4. **Teste a aplicação**
5. **Configure domínio personalizado (opcional)**

## 📞 Suporte

Se encontrar problemas:
- Verifique os logs da plataforma escolhida
- Teste localmente primeiro
- Consulte a documentação oficial da plataforma
- Verifique se todas as variáveis estão configuradas

---

**Boa sorte com seu deploy! 🚀**