# ==============================================================================
# DOCKERFILE COMPLETO PARA DEPLOY ÚNICO NO RENDER - CUPCAKES FULL STACK
# ==============================================================================
# Este Dockerfile cria uma aplicação completa que roda:
# - API Node.js/Express na porta 3000 (interno)
# - Frontend React/Vite servido pelo Nginx
# - Nginx como proxy reverso na porta 8080
# - Tudo em um único container para deploy simples no Render
# ==============================================================================

ARG NODE_VERSION=18.19.0

# ==============================================================================
# STAGE 1: Base - Configuração base
# ==============================================================================
FROM node:${NODE_VERSION}-alpine AS base

RUN apk add --no-cache \
    libc6-compat \
    dumb-init \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# ==============================================================================
# STAGE 2: API Dependencies e Build
# ==============================================================================
FROM base AS api-builder

WORKDIR /app/api

# Copiar e instalar dependências da API
COPY api/package*.json ./
COPY api/tsconfig.json ./
RUN npm ci --include=dev && npm cache clean --force

# Copiar código fonte e fazer build da API
COPY api/ ./
RUN npx prisma generate
RUN npm run build

# ==============================================================================
# STAGE 3: Web Dependencies e Build
# ==============================================================================
FROM base AS web-builder

WORKDIR /app/web

# Copiar e instalar dependências do web
COPY web/package*.json ./
RUN npm ci && npm cache clean --force

# Copiar código fonte e fazer build do web
COPY web/ ./
RUN npm run build

# ==============================================================================
# STAGE 4: Production - Imagem final com tudo
# ==============================================================================
FROM node:${NODE_VERSION}-alpine AS production

# Instalar nginx e supervisor para gerenciar múltiplos processos
RUN apk add --no-cache \
    nginx \
    supervisor \
    dumb-init \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Criar usuário não-root
RUN addgroup --system --gid 1001 appuser && \
    adduser --system --uid 1001 appuser

# ==============================================================================
# Configurar API
# ==============================================================================

# Copiar dependências de produção da API
COPY api/package*.json ./api/
WORKDIR /app/api
RUN npm ci --only=production && npm cache clean --force

# Copiar arquivos buildados da API
COPY --from=api-builder /app/api/dist ./dist
COPY --from=api-builder /app/api/prisma ./prisma
COPY --from=api-builder /app/api/node_modules/.prisma ./node_modules/.prisma

WORKDIR /app

# ==============================================================================
# Configurar Web Frontend
# ==============================================================================

# Copiar arquivos buildados do web para nginx
COPY --from=web-builder /app/web/dist /usr/share/nginx/html

# ==============================================================================
# Configurar Nginx como Proxy Reverso
# ==============================================================================

# Criar configuração do nginx
RUN mkdir -p /etc/nginx/conf.d
COPY <<EOF /etc/nginx/nginx.conf
user appuser;
worker_processes auto;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 16M;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Upstream para a API
    upstream api {
        server 127.0.0.1:3000;
    }

    server {
        listen 8080;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # Servir arquivos estáticos do frontend
        location / {
            try_files \$uri \$uri/ /index.html;
            
            # Headers de cache para assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }

        # Proxy para API
        location /api/ {
            proxy_pass http://api/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
            proxy_read_timeout 86400;
        }

        # Health check endpoint
        location /health {
            proxy_pass http://api/health;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # Nginx status (interno)
        location /nginx-health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

# ==============================================================================
# Configurar Supervisor para gerenciar processos
# ==============================================================================

COPY <<EOF /etc/supervisor/conf.d/supervisord.conf
[supervisord]
nodaemon=true
user=root
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid

[program:api]
command=node /app/api/dist/server.js
directory=/app/api
user=appuser
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/api.err.log
stdout_logfile=/var/log/supervisor/api.out.log
environment=NODE_ENV=production,PORT=3000

[program:nginx]
command=nginx -g "daemon off;"
user=root
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/nginx.err.log
stdout_logfile=/var/log/supervisor/nginx.out.log
EOF

# ==============================================================================
# Configurar permissões e diretórios
# ==============================================================================

# Criar diretórios necessários
RUN mkdir -p /var/log/supervisor \
    /var/log/nginx \
    /var/run \
    /var/cache/nginx

# Configurar permissões
RUN chown -R appuser:appuser /app \
    && chown -R appuser:appuser /usr/share/nginx/html \
    && chown -R appuser:appuser /var/log/nginx \
    && chown -R appuser:appuser /var/cache/nginx \
    && touch /var/run/nginx.pid \
    && chown appuser:appuser /var/run/nginx.pid

# ==============================================================================
# Script de inicialização
# ==============================================================================

COPY <<EOF /app/start.sh
#!/bin/sh
set -e

echo "🚀 Iniciando Cupcakes Full Stack Application..."

# Aguardar um momento para garantir que tudo está pronto
sleep 2

# Executar migrações do Prisma se necessário
if [ "\$NODE_ENV" = "production" ] && [ -n "\$DATABASE_URL" ]; then
    echo "📊 Executando migrações do banco de dados..."
    cd /app/api && npx prisma migrate deploy || echo "⚠️  Migrações falharam ou não são necessárias"
fi

echo "✅ Iniciando serviços com Supervisor..."

# Iniciar supervisor que gerencia nginx e api
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
EOF

RUN chmod +x /app/start.sh

# ==============================================================================
# Configurações finais
# ==============================================================================

# Expor porta
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Labels
LABEL maintainer="Cupcakes Team"
LABEL version="2.0.0"
LABEL description="Cupcakes Full Stack Application - Single Container"

# Comando de inicialização
CMD ["/app/start.sh"]