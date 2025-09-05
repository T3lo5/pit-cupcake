# Deploy Completo no Render - Aplicação Full Stack

Este documento contém instruções para fazer deploy completo da aplicação Cupcakes no Render com **uma única configuração** que provisiona:

- ✅ **Frontend React/Vite**
- ✅ **Backend API Node.js/Express** 
- ✅ **Banco de dados PostgreSQL**
- ✅ **Proxy reverso Nginx**
- ✅ **Configurações automáticas**

## 🚀 Deploy Automático (Recomendado)

### Opção 1: Blueprint (Infrastructure as Code)

1. **Faça commit do arquivo `render.yaml`** na raiz do seu repositório
2. **Acesse o Render Dashboard** → https://render.com
3. **Clique em "Blueprints"** → "New Blueprint"
4. **Conecte seu repositório** Git
5. **Aguarde o deploy automático** (5-10 minutos)

✨ **Pronto!** Toda a infraestrutura será criada automaticamente.

### Opção 2: Deploy Manual Simples

1. **Acesse o Render Dashboard** → https://render.com
2. **Clique em "New +"** → "Web Service"
3. **Conecte seu repositório** Git
4. **Configure apenas:**
   ```
   Name: cupcakes-app
   Environment: Docker
   Dockerfile Path: ./Dockerfile
   Port: 8080
   ```
5. **Adicione o banco de dados:**
   - Clique em "New +" → "PostgreSQL"
   - Name: `cupcakes-db`
   - Conecte ao seu web service

## 🏗️ Arquitetura da Solução

```
┌─────────────────────────────────────────┐
│           RENDER WEB SERVICE            │
│              (Porta 8080)               │
├─────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────┐   │
│  │    NGINX    │  │   NODE.JS API   │   │
│  │ Proxy/Static│  │   (Porta 3000)  │   │
│  │             │  │                 │   │
│  │ Frontend ←──┼──┤ /api/* routes   │   │
│  │ /        │  │  │                 │   │
│  │ /api/* ──┼──┼──→ Backend API     │   │
│  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────┘
              │
              ▼
    ┌─────────────────┐
    │   POSTGRESQL    │
    │   DATABASE      │
    └─────────────────┘
```

## 📋 Variáveis de Ambiente Automáticas

O sistema configura automaticamente:

### Para a API:
- `NODE_ENV=production`
- `PORT=8080`
- `DATABASE_URL` (conectado automaticamente)
- `JWT_SECRET` (gerado automaticamente)
- `CORS_ORIGIN` (URL do próprio serviço)

### Para o Frontend:
- `VITE_API_URL` (URL do próprio serviço + /api)

## 🌐 URLs Finais

Após o deploy, você terá:

- **🏠 Frontend**: `https://seu-app.onrender.com`
- **🔌 API**: `https://seu-app.onrender.com/api`
- **❤️ Health Check**: `https://seu-app.onrender.com/health`

## 🧪 Teste Local

Antes do deploy, teste localmente:

```bash
# Build e teste da aplicação completa
docker build -t cupcakes-fullstack .

# Executar localmente
docker run -p 8080:8080 \
  -e DATABASE_URL="sua_database_url_local" \
  -e JWT_SECRET="test_secret" \
  cupcakes-fullstack

# Acessar:
# Frontend: http://localhost:8080
# API: http://localhost:8080/api
```

## 🔧 Configurações Avançadas

### Personalizar Domínio

No `render.yaml`, altere:
```yaml
domains:
  - name: seu-dominio.com
```

### Ajustar Recursos

```yaml
plan: starter    # starter, standard, pro
region: oregon   # oregon, frankfurt, singapore
```

### Configurar Notificações

```yaml
notifications:
  - type: email
    emails:
      - seu-email@exemplo.com
    events:
      - deploy-succeeded
      - deploy-failed
```

## 💰 Custos Estimados

### Plano Starter (Recomendado para início):
- **Web Service**: $7/mês
- **PostgreSQL**: $7/mês
- **Total**: $14/mês

### Plano Gratuito (Limitado):
- **Web Service**: Gratuito (com limitações)
- **PostgreSQL**: Não disponível
- **Alternativa**: Use banco externo gratuito

## 🔍 Troubleshooting

### 1. Build falha
```bash
# Teste local primeiro
docker build -t test .
docker run -p 8080:8080 test
```

### 2. API não responde
- Verifique logs no Render Dashboard
- Confirme se `DATABASE_URL` está configurada
- Teste endpoint: `/health`

### 3. Frontend não carrega
- Verifique se build do Vite foi bem-sucedido
- Confirme configuração do nginx
- Teste rota: `/nginx-health`

### 4. Erro de CORS
- Verifique se `CORS_ORIGIN` está correto
- Confirme se API está respondendo em `/api/*`

## 📊 Monitoramento

### Health Checks Automáticos:
- **Aplicação**: `/health` (API + DB)
- **Nginx**: `/nginx-health`
- **Intervalo**: 30 segundos

### Logs Disponíveis:
- **Aplicação**: Logs combinados API + Nginx
- **Supervisor**: Gerenciamento de processos
- **Acesso**: Via Render Dashboard

## 🚀 Deploy em Produção

### Checklist Pré-Deploy:
- [ ] Testes locais passando
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados criado
- [ ] Domínio configurado (se aplicável)
- [ ] Monitoramento configurado

### Processo de Deploy:
1. **Push para repositório** → Deploy automático
2. **Aguardar build** (5-10 minutos)
3. **Verificar health checks**
4. **Testar aplicação**
5. **Configurar domínio personalizado** (opcional)

## 📚 Recursos Adicionais

- [Render Blueprints](https://render.com/docs/blueprint-spec)
- [Docker no Render](https://render.com/docs/docker)
- [PostgreSQL no Render](https://render.com/docs/databases)
- [Domínios Personalizados](https://render.com/docs/custom-domains)

---

## ✨ Vantagens desta Abordagem

1. **Deploy Único**: Uma configuração para tudo
2. **Custo Otimizado**: Um serviço em vez de dois
3. **Latência Baixa**: Frontend e API no mesmo container
4. **Configuração Simples**: Mínima configuração manual
5. **Escalabilidade**: Fácil de escalar verticalmente
6. **Manutenção**: Um ponto de falha, fácil debug

**🎉 Com esta configuração, você tem uma aplicação full stack completa rodando no Render com apenas alguns cliques!**