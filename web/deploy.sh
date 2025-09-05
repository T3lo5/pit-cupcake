#!/bin/bash

# Deploy script for Fly.io
# Usage: ./deploy.sh [api|web|all]

set -e

echo "🚀 Cupcakes Deploy Script for Fly.io"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
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

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    print_error "flyctl is not installed. Please install it first:"
    echo "curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Function to deploy API
deploy_api() {
    print_status "Deploying API to Fly.io..."
    cd api
    
    # Check if app exists, if not create it
    if ! flyctl apps list | grep -q "cupcakes-api"; then
        print_status "Creating new Fly.io app for API..."
        flyctl apps create cupcakes-api --org personal
        
        # Create PostgreSQL database
        print_status "Creating PostgreSQL database..."
        flyctl postgres create --name cupcakes-db --org personal --region gru
        
        # Attach database to app
        print_status "Attaching database to API..."
        flyctl postgres attach cupcakes-db --app cupcakes-api
    fi
    
    # Deploy the API
    print_status "Deploying API..."
    flyctl deploy
    
    print_success "API deployed successfully!"
    cd ..
}

# Function to deploy Web
deploy_web() {
    print_status "Deploying Web to Fly.io..."
    cd web
    
    # Check if app exists, if not create it
    if ! flyctl apps list | grep -q "cupcakes-web"; then
        print_status "Creating new Fly.io app for Web..."
        flyctl apps create cupcakes-web --org personal
    fi
    
    # Deploy the web app
    print_status "Deploying Web..."
    flyctl deploy
    
    print_success "Web deployed successfully!"
    cd ..
}

# Function to set environment variables
set_env_vars() {
    print_status "Setting up environment variables..."
    
    # API environment variables
    print_status "Setting API environment variables..."
    cd api
    flyctl secrets set JWT_SECRET="$(openssl rand -base64 32)" --app cupcakes-api
    cd ..
    
    # Web environment variables (get API URL)
    print_status "Setting Web environment variables..."
    API_URL=$(flyctl info --app cupcakes-api --json | jq -r '.Hostname' | sed 's/^/https:\/\//')
    cd web
    flyctl secrets set VITE_API_URL="$API_URL" --app cupcakes-web
    cd ..
    
    print_success "Environment variables set!"
}

# Main deployment logic
case "${1:-all}" in
    "api")
        deploy_api
        ;;
    "web")
        deploy_web
        ;;
    "all")
        deploy_api
        deploy_web
        set_env_vars
        ;;
    "env")
        set_env_vars
        ;;
    *)
        print_error "Usage: $0 [api|web|all|env]"
        echo "  api  - Deploy only the API"
        echo "  web  - Deploy only the Web frontend"
        echo "  all  - Deploy both API and Web (default)"
        echo "  env  - Set up environment variables"
        exit 1
        ;;
esac

print_success "🎉 Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Check your apps: flyctl apps list"
echo "2. View API logs: flyctl logs --app cupcakes-api"
echo "3. View Web logs: flyctl logs --app cupcakes-web"
echo "4. API URL: https://cupcakes-api.fly.dev"
echo "5. Web URL: https://cupcakes-web.fly.dev"