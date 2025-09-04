import { vi } from 'vitest';

// Mock da API
export const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

// Mock de usuário
export const mockUser = {
  id: '1',
  name: 'João Silva',
  email: 'joao@example.com',
  role: 'CUSTOMER' as const,
  createdAt: '2023-01-01T00:00:00.000Z'
};

// Mock de usuário admin
export const mockAdminUser = {
  id: '2',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'ADMIN' as const,
  createdAt: '2023-01-01T00:00:00.000Z'
};

// Mock de produto
export const mockProduct = {
  id: '1',
  name: 'Cupcake de Chocolate',
  slug: 'cupcake-chocolate',
  description: 'Delicioso cupcake de chocolate',
  priceCents: 500,
  stock: 10,
  active: true,
  categoryId: 'cat-1',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  category: {
    id: 'cat-1',
    name: 'Cupcakes',
    slug: 'cupcakes',
    active: true
  },
  images: []
};

// Mock de categoria
export const mockCategory = {
  id: 'cat-1',
  name: 'Cupcakes',
  slug: 'cupcakes',
  active: true,
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z'
};

// Mock de item do carrinho
export const mockCartItem = {
  productId: '1',
  name: 'Cupcake de Chocolate',
  priceCents: 500,
  quantity: 2,
  image: null
};

// Mock de pedido
export const mockOrder = {
  id: '1',
  userId: '1',
  status: 'PENDING' as const,
  totalCents: 1000,
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  items: [
    {
      id: '1',
      orderId: '1',
      productId: '1',
      quantity: 2,
      priceCents: 500,
      product: mockProduct
    }
  ]
};

// Função para criar mock de resposta da API
export const createApiResponse = <T>(data: T) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {}
});

// Função para criar mock de erro da API
export const createApiError = (message: string, status = 400) => ({
  response: {
    data: { message },
    status,
    statusText: status === 400 ? 'Bad Request' : 'Internal Server Error',
    headers: {},
    config: {}
  }
});

// Mock do localStorage para testes
export const createMockLocalStorage = () => {
  const storage: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key];
    }),
    clear: vi.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
    }),
    length: 0,
    key: vi.fn()
  };
};

// Função para limpar todos os mocks
export const clearAllMocks = () => {
  vi.clearAllMocks();
  mockApi.get.mockClear();
  mockApi.post.mockClear();
  mockApi.put.mockClear();
  mockApi.delete.mockClear();
};