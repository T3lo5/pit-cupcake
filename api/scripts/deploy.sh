#!/bin/bash

# ==============================================================================
# Script de Build e Deploy - Cupcakes API
# ==============================================================================
# Este script automatiza o processo de build e deploy da aplicação

set -e  # Parar execução em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    error "Docker não está instalado. Por favor, instale o Docker primeiro."
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
fi

# Função para build da aplicação
build_app() {
    log "🏗️  Iniciando build da aplicação..."
    
    # Limpar containers e imagens antigas
    log "🧹 Limpando containers e imagens antigas..."
    docker-compose down --remove-orphans || true
    docker system prune -f || true
    
    # Build da nova imagem
    log "📦 Construindo nova imagem Docker..."
    docker-compose build --no-cache cupcakes-api
    
    log "✅ Build concluído com sucesso!"
}

# Função para deploy em desenvolvimento
deploy_dev() {
    log "🚀 Iniciando deploy em desenvolvimento..."
    
    # Subir serviços de desenvolvimento
    docker-compose --profile dev up -d
    
    # Aguardar serviços ficarem prontos
    log "⏳ Aguardando serviços ficarem prontos..."
    sleep 10
    
    # Verificar health checks
    log "🔍 Verificando status dos serviços..."
    docker-compose ps
    
    log "✅ Deploy de desenvolvimento concluído!"
    info "🌐 API disponível em: http://localhost:3000"
    info "🗄️  Adminer disponível em: http://localhost:8080"
    info "📊 PostgreSQL disponível em: localhost:5432"
    info "🔴 Redis disponível em: localhost:6379"
}

# Função para deploy em produção
deploy_prod() {
    log "🚀 Iniciando deploy em produção..."
    
    # Verificar se certificados SSL existem
    if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
        warning "Certificados SSL não encontrados. Criando certificados auto-assinados..."
        mkdir -p nginx/ssl
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=BR/ST=SP/L=SaoPaulo/O=CupcakesAPI/CN=localhost"
    fi
    
    # Subir serviços de produção
    docker-compose --profile production up -d
    
    # Aguardar serviços ficarem prontos
    log "⏳ Aguardando serviços ficarem prontos..."
    sleep 15
    
    # Verificar health checks
    log "🔍 Verificando status dos serviços..."
    docker-compose ps
    
    log "✅ Deploy de produção concluído!"
    info "🌐 API disponível em: https://localhost"
    info "🔒 HTTPS habilitado com certificado auto-assinado"
}

# Função para parar todos os serviços
stop_services() {
    log "🛑 Parando todos os serviços..."
    docker-compose down
    log "✅ Serviços parados!"
}

# Função para visualizar logs
show_logs() {
    log "📋 Mostrando logs da aplicação..."
    docker-compose logs -f cupcakes-api
}

# Função para executar testes
run_tests() {
    log "🧪 Executando testes..."
    docker-compose exec cupcakes-api npm run test:ci
    log "✅ Testes concluídos!"
}

# Função para backup do banco
backup_db() {
    log "💾 Criando backup do banco de dados..."
    timestamp=$(date +%Y%m%d_%H%M%S)
    docker-compose exec postgres pg_dump -U postgres cupcakes_db > "backup_${timestamp}.sql"
    log "✅ Backup criado: backup_${timestamp}.sql"
}

# Menu principal
show_menu() {
    echo ""
    echo "===================================="
    echo "🧁 Cupcakes API - Deploy Script"
    echo "===================================="
    echo "1. 🏗️  Build da aplicação"
    echo "2. 🚀 Deploy desenvolvimento"
    echo "3. 🏭 Deploy produção"
    echo "4. 🛑 Parar serviços"
    echo "5. 📋 Ver logs"
    echo "6. 🧪 Executar testes"
    echo "7. 💾 Backup banco"
    echo "8. 🚪 Sair"
    echo "===================================="
    echo -n "Escolha uma opção: "
}

# Loop principal
while true; do
    show_menu
    read -r choice
    
    case $choice in
        1)
            build_app
            ;;
        2)
            build_app
            deploy_dev
            ;;
        3)
            build_app
            deploy_prod
            ;;
        4)
            stop_services
            ;;
        5)
            show_logs
            ;;
        6)
            run_tests
            ;;
        7)
            backup_db
            ;;
        8)
            log "👋 Até logo!"
            exit 0
            ;;
        *)
            error "Opção inválida. Tente novamente."
            ;;
    esac
    
    echo ""
    echo "Pressione Enter para continuar..."
    read -r
done