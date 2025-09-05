# 🐳 Docker Setup - Cupcakes API

Este documento contém todas as informações necessárias para executar a Cupcakes API usando Docker.

## 📋 Pré-requisitos

- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM disponível
- 10GB espaço em disco

## 🚀 Quick Start

### 1. Configuração Inicial

```bash
# Clonar o repositório
git clone <seu-repositorio>
cd cupcakes-api

# Copiar arquivo de ambiente
cp .env.example .env

# Editar variáveis de ambiente (opcional)
nano .env
```

### 2. Deploy Rápido - Desenvolvimento

```bash
# Usar script automatizado
./scripts/deploy.sh

# OU manualmente
docker-compose --profile dev up -d
```

### 3. Deploy - Produção

```bash
# Usar script automatizado (recomendado)
./scripts/deploy.sh

# OU manualmente
docker-compose --profile production up -d
```

## 🏗️ Arquitetura Docker

### Multi-Stage Build

O Dockerfile utiliza multi-stage build para otimização:

1. **Base**: Configuração comum
2. **Dependencies**: Instalação de dependências
3. **Builder**: Build da aplicação
4. **Runtime**: Imagem final otimizada

### Serviços Disponíveis

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| cupcakes-api | 3000 | API principal |
| postgres | 5432 | Banco de dados |
| redis | 6379 | Cache (opcional) |
| adminer | 8080 | Interface web PostgreSQL |
| nginx | 80/443 | Proxy reverso |

## 📦 Comandos Docker

### Build e Deploy

```bash
# Build da imagem
docker-compose build

# Subir todos os serviços
docker-compose up -d

# Subir apenas desenvolvimento
docker-compose --profile dev up -d

# Subir apenas produção
docker-compose --profile production up -d
```

### Gerenciamento

```bash
# Ver status dos containers
docker-compose ps

# Ver logs
docker-compose logs -f cupcakes-api

# Parar serviços
docker-compose down

# Remover volumes (CUIDADO!)
docker-compose down -v
```

### Manutenção

```bash
# Executar migrações
docker-compose exec cupcakes-api npx prisma migrate deploy

# Executar seed
docker-compose exec cupcakes-api npm run seed

# Backup do banco
docker-compose exec postgres pg_dump -U postgres cupcakes_db > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U postgres cupcakes_db < backup.sql
```

## 🔧 Configurações Avançadas

### Variáveis de Ambiente

Principais variáveis no `.env`:

```env
# Aplicação
NODE_ENV=production
PORT=3000

# Banco de dados
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/cupcakes_db

# Autenticação
JWT_SECRET=your-secret-key

# Redis (opcional)
REDIS_URL=redis://redis:6379
```

### Volumes Persistentes

- `postgres_data`: Dados do PostgreSQL
- `redis_data`: Dados do Redis
- `./logs`: Logs da aplicação

### Rede Docker

- Rede: `cupcakes-network`
- Subnet: `172.20.0.0/16`
- Driver: bridge

## 🔒 Segurança

### Certificados SSL

Para produção, coloque seus certificados em:
- `nginx/ssl/cert.pem`
- `nginx/ssl/key.pem`

Ou use o script para gerar certificados auto-assinados:

```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem
```

### Usuários e Permissões

- Aplicação roda como usuário `nodejs` (UID 1001)
- PostgreSQL roda como usuário `postgres`
- Nginx roda como usuário `nginx`

## 📊 Monitoramento

### Health Checks

Todos os serviços possuem health checks configurados:

- **API**: `GET /api/health`
- **PostgreSQL**: `pg_isready`
- **Redis**: `redis-cli ping`

### Logs

```bash
# Logs da aplicação
docker-compose logs -f cupcakes-api

# Logs do banco
docker-compose logs -f postgres

# Logs do nginx
docker-compose logs -f nginx

# Todos os logs
docker-compose logs -f
```

### Métricas

- Status do Nginx: `http://localhost/nginx-status`
- Health da API: `http://localhost:3000/api/health`

## 🐛 Troubleshooting

### Problemas Comuns

1. **Porta já em uso**
   ```bash
   # Verificar processos usando a porta
   lsof -i :3000
   
   # Alterar porta no docker-compose.yml
   ports:
     - "3001:3000"  # Usar porta 3001 no host
   ```

2. **Erro de permissão**
   ```bash
   # Verificar permissões dos arquivos
   ls -la
   
   # Corrigir permissões
   sudo chown -R $USER:$USER .
   ```

3. **Banco não conecta**
   ```bash
   # Verificar se PostgreSQL está rodando
   docker-compose ps postgres
   
   # Ver logs do PostgreSQL
   docker-compose logs postgres
   
   # Testar conexão
   docker-compose exec postgres psql -U postgres -d cupcakes_db
   ```

4. **Build falha**
   ```bash
   # Limpar cache do Docker
   docker system prune -a
   
   # Build sem cache
   docker-compose build --no-cache
   ```

### Comandos de Debug

```bash
# Entrar no container da API
docker-compose exec cupcakes-api sh

# Verificar variáveis de ambiente
docker-compose exec cupcakes-api env

# Verificar arquivos
docker-compose exec cupcakes-api ls -la

# Testar conectividade
docker-compose exec cupcakes-api ping postgres
```

## 🔄 CI/CD

### GitHub Actions (exemplo)

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          docker-compose build
          docker-compose --profile production up -d
```

### Fly.io Deploy

```bash
# Deploy no Fly.io
fly deploy

# Ver logs
fly logs

# Abrir aplicação
fly open
```

## 📚 Recursos Adicionais

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Redis Docker Image](https://hub.docker.com/_/redis)
- [Nginx Docker Image](https://hub.docker.com/_/nginx)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Teste com Docker
4. Faça commit das mudanças
5. Abra um Pull Request

---

**Desenvolvido com ❤️ pela equipe Cupcakes API**