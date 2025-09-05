#!/bin/bash

# ==============================================================================
# Script de Build Local - Cupcakes Full Stack Application
# ==============================================================================
# Este script permite testar o build Docker completo localmente
# antes do deploy no Render
# ==============================================================================

set -e  # Parar execução em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_message() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Função de ajuda
show_help() {
    echo "Uso: $0 [OPÇÕES]"
    echo ""
    echo "DESCRIÇÃO:"
    echo "  Build e teste da aplicação Cupcakes Full Stack"
    echo "  (API + Web Frontend + Nginx + PostgreSQL)"
    echo ""
    echo "OPÇÕES:"
    echo "  -h, --help     - Mostrar esta ajuda"
    echo "  -c, --clean    - Limpar imagens Docker antes do build"
    echo "  -r, --run      - Executar o container após o build"
    echo "  -d, --db       - Iniciar PostgreSQL local para testes"
    echo "  -s, --stop     - Parar todos os containers"
    echo "  -l, --logs     - Mostrar logs do container"
    echo ""
    echo "EXEMPLOS:"
    echo "  $0                        # Build da aplicação"
    echo "  $0 --run                  # Build e executar"
    echo "  $0 --clean --run --db     # Build completo com banco"
    echo "  $0 --stop                 # Parar todos os containers"
    echo "  $0 --logs                 # Ver logs da aplicação"
}

# Função para limpar imagens Docker
clean_docker() {
    print_message "Limpando imagens Docker antigas..."
    
    # Parar containers se estiverem rodando
    docker stop cupcakes-fullstack cupcakes-postgres 2>/dev/null || true
    docker rm cupcakes-fullstack cupcakes-postgres 2>/dev/null || true
    
    # Remover imagens do projeto
    docker rmi cupcakes-fullstack:latest 2>/dev/null || true
    
    # Limpar imagens não utilizadas
    docker image prune -f
    
    print_success "Limpeza concluída!"
}

# Função para build da aplicação completa
build_app() {
    print_message "Iniciando build da aplicação Full Stack..."
    print_message "Isso pode levar alguns minutos..."
    
    docker build \
        -t cupcakes-fullstack:latest \
        -f Dockerfile \
        .
    
    print_success "Build da aplicação concluído!"
}

# Função para iniciar PostgreSQL local
start_postgres() {
    print_message "Iniciando PostgreSQL local para testes..."
    
    # Parar container existente se estiver rodando
    docker stop cupcakes-postgres 2>/dev/null || true
    docker rm cupcakes-postgres 2>/dev/null || true
    
    docker run -d \
        --name cupcakes-postgres \
        -e POSTGRES_DB=cupcakes \
        -e POSTGRES_USER=cupcakes_user \
        -e POSTGRES_PASSWORD=cupcakes_pass \
        -p 5432:5432 \
        postgres:15-alpine
    
    # Aguardar PostgreSQL inicializar
    print_message "Aguardando PostgreSQL inicializar..."
    sleep 10
    
    print_success "PostgreSQL rodando na porta 5432"
    print_message "Credenciais: cupcakes_user / cupcakes_pass"
    print_message "Database: cupcakes"
}

# Função para executar a aplicação
run_app() {
    print_message "Executando aplicação Full Stack na porta 8080..."
    
    # Parar container existente se estiver rodando
    docker stop cupcakes-fullstack 2>/dev/null || true
    docker rm cupcakes-fullstack 2>/dev/null || true
    
    # Definir DATABASE_URL baseado se PostgreSQL local está rodando
    if docker ps | grep -q cupcakes-postgres; then
        DATABASE_URL="postgresql://cupcakes_user:cupcakes_pass@host.docker.internal:5432/cupcakes"
        print_message "Usando PostgreSQL local"
    else
        DATABASE_URL="file:./dev.db"
        print_warning "PostgreSQL não encontrado, usando SQLite"
    fi
    
    docker run -d \
        --name cupcakes-fullstack \
        -p 8080:8080 \
        -e NODE_ENV=development \
        -e DATABASE_URL="$DATABASE_URL" \
        -e JWT_SECRET="local_development_secret_key_123" \
        -e CORS_ORIGIN="http://localhost:8080" \
        -e VITE_API_URL="http://localhost:8080" \
        cupcakes-fullstack:latest
    
    # Aguardar aplicação inicializar
    print_message "Aguardando aplicação inicializar..."
    sleep 15
    
    # Verificar se está rodando
    if curl -s http://localhost:8080/health > /dev/null; then
        print_success "✅ Aplicação rodando com sucesso!"
        echo ""
        print_message "🌐 URLs disponíveis:"
        echo "  Frontend:    http://localhost:8080"
        echo "  API:         http://localhost:8080/api"
        echo "  Health:      http://localhost:8080/health"
        echo "  Nginx:       http://localhost:8080/nginx-health"
        echo ""
        print_message "📊 Para ver logs: $0 --logs"
        print_message "🛑 Para parar: $0 --stop"
    else
        print_error "❌ Aplicação falhou ao inicializar"
        print_message "Verificando logs..."
        docker logs cupcakes-fullstack --tail 20
    fi
}

# Função para parar containers
stop_containers() {
    print_message "Parando todos os containers..."
    
    docker stop cupcakes-fullstack cupcakes-postgres 2>/dev/null || true
    docker rm cupcakes-fullstack cupcakes-postgres 2>/dev/null || true
    
    print_success "Containers parados!"
}

# Função para mostrar logs
show_logs() {
    if docker ps | grep -q cupcakes-fullstack; then
        print_message "Logs da aplicação (Ctrl+C para sair):"
        docker logs -f cupcakes-fullstack
    else
        print_error "Container cupcakes-fullstack não está rodando"
        print_message "Execute: $0 --run"
    fi
}

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker não está instalado ou não está no PATH"
    exit 1
fi

# Verificar se Docker está rodando
if ! docker info &> /dev/null; then
    print_error "Docker não está rodando. Inicie o Docker e tente novamente."
    exit 1
fi

# Verificar se curl está disponível
if ! command -v curl &> /dev/null; then
    print_warning "curl não encontrado. Health check pode não funcionar."
fi

# Variáveis de controle
CLEAN=false
RUN=false
DB=false
STOP=false
LOGS=false

# Parse dos argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -c|--clean)
            CLEAN=true
            shift
            ;;
        -r|--run)
            RUN=true
            shift
            ;;
        -d|--db)
            DB=true
            shift
            ;;
        -s|--stop)
            STOP=true
            shift
            ;;
        -l|--logs)
            LOGS=true
            shift
            ;;
        *)
            print_error "Opção desconhecida: $1"
            show_help
            exit 1
            ;;
    esac
done

# Executar ações baseadas nos argumentos
if [ "$STOP" = true ]; then
    stop_containers
    exit 0
fi

if [ "$LOGS" = true ]; then
    show_logs
    exit 0
fi

if [ "$CLEAN" = true ]; then
    clean_docker
fi

if [ "$DB" = true ]; then
    start_postgres
fi

# Build sempre é executado (exceto para --stop e --logs)
build_app

if [ "$RUN" = true ]; then
    run_app
fi

print_success "Script concluído com sucesso!"

# Mostrar informações úteis
echo ""
print_message "📋 Comandos úteis:"
echo "  docker ps                           # Ver containers rodando"
echo "  docker images                       # Ver imagens criadas"
echo "  docker logs cupcakes-fullstack      # Ver logs da aplicação"
echo "  docker logs cupcakes-postgres       # Ver logs do PostgreSQL"
echo "  docker exec -it cupcakes-fullstack sh  # Acessar container"

if [ "$RUN" = false ]; then
    echo ""
    print_message "🚀 Para executar a aplicação:"
    echo "  $0 --run"
fi