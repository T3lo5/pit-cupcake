# ==============================================================================
# DOCKERFILE COMPLETO PARA MONOREPO - CUPCAKES API
# ==============================================================================
# Este Dockerfile utiliza multi-stage build para otimizar o tamanho da imagem
# e melhorar a segurança em produção
# ==============================================================================

# Definir versão do Node.js como argumento para facilitar atualizações
ARG NODE_VERSION=18.19.0

# ==============================================================================
# STAGE 1: Base - Configuração base comum para todos os stages
# ==============================================================================
FROM node:${NODE_VERSION}-alpine AS base

# Instalar dependências do sistema necessárias
RUN apk add --no-cache \
    libc6-compat \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Configurar diretório de trabalho
WORKDIR /app

# Configurar usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# ==============================================================================
# STAGE 2: Dependencies - Instalar dependências
# ==============================================================================
FROM base AS deps

# Copiar arquivos de configuração de dependências
COPY package*.json ./
COPY tsconfig.json ./

# Instalar todas as dependências (incluindo devDependencies para build)
RUN npm ci --include=dev && npm cache clean --force

# ==============================================================================
# STAGE 3: Builder - Build da aplicação
# ==============================================================================
FROM base AS builder

WORKDIR /app

# Copiar dependências do stage anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fonte e arquivos de configuração
COPY . .

# Gerar cliente Prisma
RUN npx prisma generate

# Executar linting e testes (opcional - remova se quiser build mais rápido)
# RUN npm run lint
# RUN npm run test:ci

# Build da aplicação TypeScript
RUN npm run build

# Instalar apenas dependências de produção
RUN npm ci --only=production && npm cache clean --force

# ==============================================================================
# STAGE 4: Runtime - Imagem final de produção
# ==============================================================================
FROM base AS runtime

WORKDIR /app

# Configurar variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000
ENV NPM_CONFIG_CACHE=/tmp/.npm

# Criar diretórios necessários com permissões corretas
RUN mkdir -p /app/dist /app/logs /tmp/.npm && \
    chown -R nodejs:nodejs /app /tmp/.npm

# Copiar arquivos necessários do builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Copiar script de inicialização personalizado
COPY --chown=nodejs:nodejs <<EOF /app/start.sh
#!/bin/sh
set -e

echo "🚀 Iniciando Cupcakes API..."

# Verificar se o banco de dados está acessível
echo "📊 Verificando conexão com banco de dados..."
npx prisma db push --accept-data-loss || {
    echo "❌ Erro ao conectar com banco de dados"
    exit 1
}

# Executar migrações
echo "🔄 Executando migrações do banco..."
npx prisma migrate deploy || {
    echo "❌ Erro ao executar migrações"
    exit 1
}

# Executar seed se necessário (opcional)
# echo "🌱 Executando seed do banco..."
# npm run seed || echo "⚠️  Seed falhou, continuando..."

echo "✅ Inicialização concluída!"
echo "🌐 Iniciando servidor na porta \$PORT..."

# Iniciar aplicação
exec node dist/server.js
EOF

# Tornar script executável
RUN chmod +x /app/start.sh

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Labels para metadados
LABEL maintainer="Cupcakes API Team"
LABEL version="1.0.0"
LABEL description="API completa para sistema de cupcakes com Node.js, TypeScript e Prisma"

# Comando de inicialização usando dumb-init para gerenciamento correto de processos
ENTRYPOINT ["dumb-init", "--"]
CMD ["/app/start.sh"]