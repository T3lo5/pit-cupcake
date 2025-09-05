# Testes do Projeto Cupcakes

Este documento descreve como executar e trabalhar com os testes do projeto Cupcakes.

## Estrutura dos Testes

O projeto possui testes tanto para o backend (API) quanto para o frontend (Web):

### Backend (API)
- **Framework**: Jest + Supertest
- **Localização**: `api/src/__tests__/`
- **Configuração**: `api/jest.config.js`

### Frontend (Web)
- **Framework**: Vitest + Testing Library
- **Localização**: `web/src/__tests__/`, `web/src/components/__tests__/`, etc.
- **Configuração**: `web/vite.config.ts`

## Executando os Testes

### Backend (API)

```bash
cd api

# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com coverage
npm run test:coverage

# Executar testes para CI
npm run test:ci
```

### Frontend (Web)

```bash
cd web

# Executar todos os testes
npm test

# Executar testes uma vez
npm run test:run

# Executar testes em modo watch
npm run test:watch

# Executar testes com coverage
npm run test:coverage

# Executar testes com interface gráfica
npm run test:ui
```

### Executar todos os testes do projeto

```bash
# Na raiz do projeto
npm run test:api && npm run test:web
```

## Tipos de Testes Implementados

### Backend

1. **Testes de Serviços (Unit Tests)**
   - `AuthService.test.ts`: Testes para autenticação
   - `ProductsService.test.ts`: Testes para produtos

2. **Testes de Controladores (Integration Tests)**
   - `AuthController.test.ts`: Testes de endpoints de autenticação
   - `ProductsController.test.ts`: Testes de endpoints de produtos

3. **Utilitários de Teste**
   - `helpers.ts`: Funções auxiliares para criar dados de teste
   - `setup.ts`: Configuração do ambiente de teste

### Frontend

1. **Testes de Componentes**
   - `Header.test.tsx`: Testes do componente Header

2. **Testes de Stores (State Management)**
   - `auth.test.ts`: Testes da store de autenticação
   - `cart.test.ts`: Testes da store do carrinho

3. **Testes de Páginas**
   - `Login.test.tsx`: Testes da página de login

4. **Utilitários de Teste**
   - `helpers.ts`: Mocks e funções auxiliares
   - `setup.ts`: Configuração do ambiente de teste

## Configuração do Ambiente de Teste

### Backend

O ambiente de teste da API está configurado para:
- Usar variáveis de ambiente específicas para teste
- Limpar o banco de dados entre testes
- Usar JWT secrets específicos para teste

### Frontend

O ambiente de teste do frontend está configurado para:
- Usar jsdom como ambiente de teste
- Mockar localStorage e fetch
- Incluir matchers do Testing Library

## Cobertura de Código

### Backend
Os testes cobrem:
- ✅ Autenticação (registro, login, refresh token)
- ✅ Produtos (CRUD completo)
- ✅ Validações de dados
- ✅ Tratamento de erros

### Frontend
Os testes cobrem:
- ✅ Componentes principais (Header)
- ✅ Gerenciamento de estado (Auth, Cart)
- ✅ Páginas principais (Login)
- ✅ Interações do usuário

## Boas Práticas

### Escrevendo Novos Testes

1. **Organize por funcionalidade**: Agrupe testes relacionados em `describe` blocks
2. **Use nomes descritivos**: Descreva claramente o que cada teste faz
3. **Teste casos de sucesso e erro**: Inclua testes para cenários positivos e negativos
4. **Limpe dados entre testes**: Use `beforeEach` para garantir isolamento
5. **Use mocks apropriados**: Mocke dependências externas (API, localStorage, etc.)

### Estrutura de Teste Recomendada

```typescript
describe('ComponenteOuServiço', () => {
  beforeEach(() => {
    // Configuração antes de cada teste
  });

  describe('funcionalidade específica', () => {
    it('deve fazer algo específico', () => {
      // Arrange
      // Act
      // Assert
    });

    it('deve falhar quando...', () => {
      // Teste de caso de erro
    });
  });
});
```

## Comandos Úteis

```bash
# Executar apenas testes que mudaram
npm test -- --onlyChanged

# Executar testes de um arquivo específico
npm test AuthService.test.ts

# Executar testes com verbose output
npm test -- --verbose

# Atualizar snapshots (se usando)
npm test -- --updateSnapshot
```

## Debugging

### Backend
- Use `console.log` nos testes para debug
- Configure breakpoints no VS Code
- Use `--detectOpenHandles` para encontrar handles não fechados

### Frontend
- Use `screen.debug()` para ver o DOM renderizado
- Configure breakpoints no VS Code
- Use `--reporter=verbose` para mais detalhes

## Integração Contínua

Os testes estão configurados para rodar em CI com:
- Cobertura de código
- Relatórios de teste
- Falha em caso de testes quebrados

Para configurar em seu CI, use:
```bash
npm run test:ci  # Backend
npm run test:coverage  # Frontend
```