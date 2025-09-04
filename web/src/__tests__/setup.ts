import '@testing-library/jest-dom';

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock do fetch
global.fetch = vi.fn();

// Limpar mocks antes de cada teste
beforeEach(() => {
  vi.clearAllMocks();
});