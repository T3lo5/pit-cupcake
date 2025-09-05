-- ==============================================================================
-- Script de Inicialização do Banco de Dados PostgreSQL
-- ==============================================================================
-- Este script é executado automaticamente quando o container PostgreSQL é criado

-- Criar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Configurar timezone
SET timezone = 'America/Sao_Paulo';

-- Criar usuário adicional para a aplicação (opcional)
-- CREATE USER cupcakes_user WITH PASSWORD 'cupcakes_password';
-- GRANT ALL PRIVILEGES ON DATABASE cupcakes_db TO cupcakes_user;

-- Log de inicialização
SELECT 'Database cupcakes_db initialized successfully!' as message;