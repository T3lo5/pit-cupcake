# Relatório de Testes - cupcakes-web

Gerado em: 2025-09-03 23:27:23.342

Resumo:
- Total: 50
- Passaram: 48
- Falharam: 2
- Ignorados: 0
- Duração total: 3.11 s

## Suites e Casos
### src/components/__tests__/Header.test.tsx
- ✅ deve exibir links de login e cadastro (passed, 175 ms)
- ✅ deve exibir carrinho vazio (passed, 15 ms)
- ✅ não deve exibir links de admin (passed, 13 ms)
- ✅ deve exibir nome do usuário (passed, 10 ms)
- ✅ deve exibir botão de sair (passed, 15 ms)
- ✅ deve exibir quantidade de itens no carrinho (passed, 7 ms)
- ✅ não deve exibir links de login e cadastro (passed, 6 ms)
- ✅ não deve exibir links de admin (passed, 7 ms)
- ✅ deve exibir links de admin (passed, 14 ms)
- ✅ deve chamar logout e navegar para login ao clicar em sair (passed, 37 ms)
- ✅ deve ter link para home (passed, 6 ms)
- ✅ deve ter link para carrinho (passed, 7 ms)
- ✅ deve ter link para pedidos (passed, 9 ms)

### src/pages/__tests__/Login.test.tsx
- ✅ deve renderizar formulário de login (passed, 184 ms)
- ✅ deve ter valores padrão nos campos (passed, 8 ms)
- ✅ deve permitir alterar valores dos campos (passed, 168 ms)
- ❌ deve fazer login com sucesso (failed, 1.13 s)
  - Falhas:
    - expected "spy" to be called with arguments: [ { user: { id: '1', …(3) }, …(2) } ][90m  Received:   [39m[90m  Number of calls: [1m0[22m [39m  Ignored nodes: comments, script, style [36m<html>[39m   [36m<head />[39m   [36m<body>[39m     [36m<div>[39m       [36m<div[39m         [33mclass[39m=[32m"max-w-sm mx-auto p-4"[39m       [36m>[39m         [36m<h1[39m           [33mclass[39m=[32m"text-xl font-semibold mb-3"[39m         [36m>[39m           [0mEntrar[0m         [36m</h1>[39m         [36m<input[39m           [33mclass[39m=[32m"border rounded px-3 py-2 w-full mb-2"[39m           [33mplaceholder[39m=[32m"Email"[39m           [33mvalue[39m=[32m"joao@test.com"[39m         [36m/>[39m         [36m<input[39m           [33mclass[39m=[32m"border rounded px-3 py-2 w-full mb-2"[39m           [33mplaceholder[39m=[32m"Senha"[39m           [33mtype[39m=[32m"password"[39m           [33mvalue[39m=[32m"123456"[39m         [36m/>[39m         [36m<button[39m           [33mclass[39m=[32m"w-full px-4 py-2 bg-black text-white rounded"[39m         [36m>[39m           [0mEntrar[0m         [36m</button>[39m         [36m<div[39m           [33mclass[39m=[32m"mt-3 text-red-600"[39m         [36m>[39m           [0mErro no login[0m         [36m</div>[39m         [36m<div[39m           [33mclass[39m=[32m"mt-3 text-sm"[39m         [36m>[39m           [0mNão tem conta?[0m           [0m [0m           [36m<a[39m             [33mclass[39m=[32m"text-blue-600"[39m             [33mhref[39m=[32m"/register"[39m           [36m>[39m             [0mCadastre-se[0m           [36m</a>[39m         [36m</div>[39m       [36m</div>[39m     [36m</div>[39m   [36m</body>[39m [36m</html>[39m
- ❌ deve navegar para página de origem após login (failed, 1.02 s)
  - Falhas:
    - expected "spy" to be called with arguments: [ '/cart', { replace: true } ][90m  Received:   [39m[90m  Number of calls: [1m0[22m [39m  Ignored nodes: comments, script, style [36m<html>[39m   [36m<head />[39m   [36m<body>[39m     [36m<div>[39m       [36m<div[39m         [33mclass[39m=[32m"max-w-sm mx-auto p-4"[39m       [36m>[39m         [36m<h1[39m           [33mclass[39m=[32m"text-xl font-semibold mb-3"[39m         [36m>[39m           [0mEntrar[0m         [36m</h1>[39m         [36m<input[39m           [33mclass[39m=[32m"border rounded px-3 py-2 w-full mb-2"[39m           [33mplaceholder[39m=[32m"Email"[39m           [33mvalue[39m=[32m"admin@cupcakes.dev"[39m         [36m/>[39m         [36m<input[39m           [33mclass[39m=[32m"border rounded px-3 py-2 w-full mb-2"[39m           [33mplaceholder[39m=[32m"Senha"[39m           [33mtype[39m=[32m"password"[39m           [33mvalue[39m=[32m"admin123"[39m         [36m/>[39m         [36m<button[39m           [33mclass[39m=[32m"w-full px-4 py-2 bg-black text-white rounded"[39m         [36m>[39m           [0mEntrar[0m         [36m</button>[39m         [36m<div[39m           [33mclass[39m=[32m"mt-3 text-red-600"[39m         [36m>[39m           [0mErro no login[0m         [36m</div>[39m         [36m<div[39m           [33mclass[39m=[32m"mt-3 text-sm"[39m         [36m>[39m           [0mNão tem conta?[0m           [0m [0m           [36m<a[39m             [33mclass[39m=[32m"text-blue-600"[39m             [33mhref[39m=[32m"/register"[39m           [36m>[39m             [0mCadastre-se[0m           [36m</a>[39m         [36m</div>[39m       [36m</div>[39m     [36m</div>[39m   [36m</body>[39m [36m</html>[39m
- ✅ deve exibir mensagem de erro em caso de falha (passed, 17 ms)
- ✅ deve exibir mensagem de erro genérica quando não há mensagem específica (passed, 16 ms)
- ✅ deve limpar mensagem de erro ao tentar novo login (passed, 25 ms)
- ✅ deve ter link para página de cadastro (passed, 4 ms)

### src/store/__tests__/auth.test.ts
- ✅ deve inicializar com dados do localStorage (passed, 50 ms)
- ✅ deve inicializar com valores null quando localStorage está vazio (passed, 5 ms)
- ✅ deve definir dados de autenticação e salvar no localStorage (passed, 11 ms)
- ✅ deve manter refresh token existente quando não fornecido (passed, 10 ms)
- ✅ deve limpar dados de autenticação e localStorage (passed, 7 ms)
- ✅ true para admin (passed, 6 ms)
- ✅ false para customer (passed, 5 ms)
- ✅ false quando não há usuário (passed, 4 ms)
- ✅ true quando há access token (passed, 9 ms)
- ✅ false quando não há access token (passed, 4 ms)
- ✅ renova access token com sucesso (passed, 14 ms)
- ✅ retorna null quando não há refresh token (passed, 4 ms)
- ✅ faz logout quando refresh falha (passed, 6 ms)

### src/store/__tests__/cart.test.ts
- ✅ deve inicializar com carrinho vazio quando localStorage está vazio (passed, 34 ms)
- ✅ deve carregar itens do localStorage (passed, 4 ms)
- ✅ deve normalizar dados inválidos do localStorage (passed, 4 ms)
- ✅ deve adicionar novo item ao carrinho (passed, 10 ms)
- ✅ deve incrementar quantidade de item existente (passed, 5 ms)
- ✅ deve usar quantidade padrão 1 quando não especificada (passed, 3 ms)
- ✅ deve normalizar valores inválidos (passed, 4 ms)
- ✅ deve remover item do carrinho (passed, 3 ms)
- ✅ não deve afetar outros itens (passed, 5 ms)
- ✅ deve alterar quantidade de item existente (passed, 4 ms)
- ✅ não deve remover item quando quantidade for 0 ou negativa (normaliza para 1) (passed, 3 ms)
- ✅ deve garantir quantidade mínima de 1 (passed, 3 ms)
- ✅ deve limpar todos os itens do carrinho (passed, 2 ms)
- ✅ deve calcular subtotal corretamente (passed, 2 ms)
- ✅ deve retornar 0 para carrinho vazio (passed, 1 ms)
