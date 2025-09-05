#!/bin/bash

# ==============================================================================
# Script de Validação - Cupcakes API Docker Setup
# ==============================================================================
# Este script valida se todos os componentes Docker estão funcionando corretamente

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Contadores
TESTS_PASSED=0
TESTS_FAILED=0

# Função para log
log() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

success() {
    echo -e "${GREEN}[✓] $1${NC}"
    ((TESTS_PASSED++))
}

error() {
    echo -e "${RED}[✗] $1${NC}"
    ((TESTS_FAILED++))
}

warning() {
    echo -e "${YELLOW}[!] $1${NC}"
}

# Função para testar se um serviço está rodando
test_service() {
    local service=$1
    local port=$2
    local timeout=${3:-10}
    
    log "Testando serviço $service na porta $port..."
    
    if timeout $timeout bash -c "echo >/dev/tcp/localhost/$port" 2>/dev/null; then
        success "Serviço $service está respondendo na porta $port"
        return 0
    else
        error "Serviço $service não está respondendo na porta $port"
        return 1
    fi
}

# Função para testar endpoint HTTP
test_http_endpoint() {
    local url=$1
    local expected_status=${2:-200}
    local timeout=${3:-10}
    
    log "Testando endpoint: $url"
    
    if command -v curl &> /dev/null; then
        local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time $timeout "$url" 2>/dev/null || echo "000")
        
        if [ "$status" = "$expected_status" ]; then
            success "Endpoint $url retornou status $status"
            return 0
        else
            error "Endpoint $url retornou status $status (esperado: $expected_status)"
            return 1
        fi
    else
        warning "curl não está instalado, pulando teste HTTP"
        return 0
    fi
}

# Função para testar container Docker
test_container() {
    local container=$1
    
    log "Verificando container $container..."
    
    if docker ps --format "table {{.Names}}" | grep -q "^$container$"; then
        local status=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "unknown")
        
        if [ "$status" = "healthy" ] || [ "$status" = "unknown" ]; then
            success "Container $container está rodando"
            return 0
        else
            error "Container $container não está saudável (status: $status)"
            return 1
        fi
    else
        error "Container $container não está rodando"
        return 1
    fi
}

# Função principal de validação
run_validation() {
    echo ""
    echo "===================================="
    echo "🧁 Cupcakes API - Validação Docker"
    echo "===================================="
    echo ""
    
    # Verificar se Docker está rodando
    log "Verificando se Docker está rodando..."
    if docker info &> /dev/null; then
        success "Docker está rodando"
    else
        error "Docker não está rodando ou não está acessível"
        exit 1
    fi
    
    # Verificar se Docker Compose está disponível
    log "Verificando Docker Compose..."
    if command -v docker-compose &> /dev/null; then
        success "Docker Compose está disponível"
    else
        error "Docker Compose não está instalado"
        exit 1
    fi
    
    echo ""
    echo "📦 Testando Containers..."
    echo "========================"
    
    # Testar containers
    test_container "cupcakes-api"
    test_container "cupcakes-postgres"
    
    # Testar containers opcionais
    if docker ps --format "table {{.Names}}" | grep -q "cupcakes-redis"; then
        test_container "cupcakes-redis"
    else
        warning "Container Redis não está rodando (opcional)"
    fi
    
    if docker ps --format "table {{.Names}}" | grep -q "cupcakes-nginx"; then
        test_container "cupcakes-nginx"
    else
        warning "Container Nginx não está rodando (opcional)"
    fi
    
    if docker ps --format "table {{.Names}}" | grep -q "cupcakes-adminer"; then
        test_container "cupcakes-adminer"
    else
        warning "Container Adminer não está rodando (opcional)"
    fi
    
    echo ""
    echo "🌐 Testando Conectividade..."
    echo "============================"
    
    # Testar portas dos serviços
    test_service "API" 3000
    test_service "PostgreSQL" 5432
    
    # Testar serviços opcionais
    if docker ps --format "table {{.Names}}" | grep -q "cupcakes-redis"; then
        test_service "Redis" 6379
    fi
    
    if docker ps --format "table {{.Names}}" | grep -q "cupcakes-adminer"; then
        test_service "Adminer" 8080
    fi
    
    if docker ps --format "table {{.Names}}" | grep -q "cupcakes-nginx"; then
        test_service "Nginx HTTP" 80
        test_service "Nginx HTTPS" 443
    fi
    
    echo ""
    echo "🔍 Testando Endpoints..."
    echo "======================="
    
    # Testar endpoints da API
    test_http_endpoint "http://localhost:3000/api/health" 200
    
    # Testar Adminer se estiver rodando
    if docker ps --format "table {{.Names}}" | grep -q "cupcakes-adminer"; then
        test_http_endpoint "http://localhost:8080" 200
    fi
    
    # Testar Nginx se estiver rodando
    if docker ps --format "table {{.Names}}" | grep -q "cupcakes-nginx"; then
        test_http_endpoint "http://localhost/health" 200
    fi
    
    echo ""
    echo "🗄️  Testando Banco de Dados..."
    echo "=============================="
    
    # Testar conexão com PostgreSQL
    log "Testando conexão com PostgreSQL..."
    if docker-compose exec -T postgres psql -U postgres -d cupcakes_db -c "SELECT 1;" &> /dev/null; then
        success "Conexão com PostgreSQL está funcionando"
    else
        error "Não foi possível conectar com PostgreSQL"
    fi
    
    # Testar Prisma
    log "Testando Prisma..."
    if docker-compose exec -T cupcakes-api npx prisma db push --accept-data-loss &> /dev/null; then
        success "Prisma está funcionando corretamente"
    else
        error "Prisma não está funcionando"
    fi
    
    echo ""
    echo "📊 Verificando Recursos..."
    echo "========================="
    
    # Verificar uso de memória
    log "Verificando uso de memória dos containers..."
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | head -10
    
    # Verificar volumes
    log "Verificando volumes Docker..."
    if docker volume ls | grep -q "cupcakes"; then
        success "Volumes Docker estão criados"
        docker volume ls | grep "cupcakes"
    else
        warning "Nenhum volume específico encontrado"
    fi
    
    # Verificar rede
    log "Verificando rede Docker..."
    if docker network ls | grep -q "cupcakes-network"; then
        success "Rede cupcakes-network está criada"
    else
        warning "Rede cupcakes-network não encontrada"
    fi
    
    echo ""
    echo "=============================="
    echo "📋 Resumo da Validação"
    echo "=============================="
    echo -e "Testes passaram: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Testes falharam: ${RED}$TESTS_FAILED${NC}"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo ""
        success "🎉 Todos os testes passaram! Sua aplicação está funcionando corretamente."
        echo ""
        echo "🌐 Acesse sua aplicação em:"
        echo "   • API: http://localhost:3000"
        echo "   • Health Check: http://localhost:3000/api/health"
        
        if docker ps --format "table {{.Names}}" | grep -q "cupcakes-adminer"; then
            echo "   • Adminer: http://localhost:8080"
        fi
        
        if docker ps --format "table {{.Names}}" | grep -q "cupcakes-nginx"; then
            echo "   • Nginx: http://localhost"
        fi
        
        exit 0
    else
        echo ""
        error "❌ Alguns testes falharam. Verifique os logs acima para mais detalhes."
        echo ""
        echo "💡 Dicas para resolver problemas:"
        echo "   • Verifique se todos os serviços estão rodando: docker-compose ps"
        echo "   • Veja os logs: docker-compose logs -f"
        echo "   • Reinicie os serviços: docker-compose restart"
        echo "   • Reconstrua as imagens: docker-compose build --no-cache"
        
        exit 1
    fi
}

# Executar validação
run_validation