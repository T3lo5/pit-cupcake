import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../store/auth', () => ({
  useAuth: vi.fn(),
}));
vi.mock('../../store/cart', () => ({
  useCart: vi.fn(),
}));
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { MemoryRouter } from 'react-router-dom';
import Header from '../Header';
import { useAuth } from '../../store/auth';
import { useCart } from '../../store/cart';

type AuthMockShape = {
  isLogged: () => boolean;
  isAdmin: () => boolean;
  user: { name: string } | null;
  logout: () => void;
};

const asAny = (v: unknown) => v as any;

const renderHeader = () =>
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();

  asAny(useAuth).mockReturnValue({
    isLogged: () => false,
    isAdmin: () => false,
    user: null,
    logout: vi.fn(),
  } as AuthMockShape);

  asAny(useCart).mockImplementation((selector: any) => {
    const state = { items: [] as Array<{ quantity: number }> };
    return selector ? selector(state) : state;
  });
});

describe('Header', () => {
  describe('quando usuário não está logado', () => {
    it('deve exibir links de login e cadastro', () => {
      renderHeader();
      expect(screen.getByRole('link', { name: 'Entrar' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Cadastrar' })).toBeInTheDocument();
    });

    it('deve exibir carrinho vazio', () => {
      renderHeader();
      expect(screen.getByRole('link', { name: /Carrinho \(0\)/ })).toBeInTheDocument();
    });

    it('não deve exibir links de admin', () => {
      renderHeader();
      expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Produtos' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Pedidos \(Admin\)/ })).not.toBeInTheDocument();
    });
  });

  describe('quando usuário está logado como cliente', () => {
    beforeEach(() => {
      asAny(useAuth).mockReturnValue({
        isLogged: () => true,
        isAdmin: () => false,
        user: { name: 'João' },
        logout: vi.fn(),
      } as AuthMockShape);

      asAny(useCart).mockImplementation((selector: any) => {
        const state = { items: [{ quantity: 1 }, { quantity: 2 }] };
        return selector ? selector(state) : state;
      });
    });

    it('deve exibir nome do usuário', () => {
      renderHeader();
      expect(screen.getByText('João')).toBeInTheDocument();
    });

    it('deve exibir botão de sair', () => {
      renderHeader();
      expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument();
    });

    it('deve exibir quantidade de itens no carrinho', () => {
      renderHeader();
      expect(screen.getByRole('link', { name: /Carrinho \(3\)/ })).toBeInTheDocument();
    });

    it('não deve exibir links de login e cadastro', () => {
      renderHeader();
      expect(screen.queryByRole('link', { name: 'Entrar' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Cadastrar' })).not.toBeInTheDocument();
    });

    it('não deve exibir links de admin', () => {
      renderHeader();
      expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Produtos' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Pedidos \(Admin\)/ })).not.toBeInTheDocument();
    });
  });

  describe('quando usuário está logado como admin', () => {
    beforeEach(() => {
      asAny(useAuth).mockReturnValue({
        isLogged: () => true,
        isAdmin: () => true,
        user: { name: 'Admin' },
        logout: vi.fn(),
      } as AuthMockShape);

      asAny(useCart).mockImplementation((selector: any) => {
        const state = { items: [] as Array<{ quantity: number }> };
        return selector ? selector(state) : state;
      });
    });

    it('deve exibir links de admin', () => {
      renderHeader();
      expect(screen.getByRole('link', { name: 'Admin' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Produtos' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Pedidos \(Admin\)/ })).toBeInTheDocument();
    });

    it('deve chamar logout e navegar para login ao clicar em sair', async () => {
      const user = userEvent.setup();
      const logoutSpy = vi.fn();
      asAny(useAuth).mockReturnValue({
        isLogged: () => true,
        isAdmin: () => true,
        user: { name: 'Admin' },
        logout: logoutSpy,
      } as AuthMockShape);

      renderHeader();

      await user.click(screen.getByRole('button', { name: 'Sair' }));
      expect(logoutSpy).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('navegação', () => {
    it('deve ter link para home', () => {
      renderHeader();
      const home = screen.getByRole('link', { name: 'Cupcakes' });
      expect(home).toHaveAttribute('href', '/');
    });

    it('deve ter link para carrinho', () => {
      renderHeader();
      const cart = screen.getByRole('link', { name: /Carrinho/ });
      expect(cart).toHaveAttribute('href', '/cart');
    });

    it('deve ter link para pedidos', () => {
      renderHeader();
      const orders = screen.getByRole('link', { name: 'Pedidos' });
      expect(orders).toHaveAttribute('href', '/orders');
    });
  });
});
