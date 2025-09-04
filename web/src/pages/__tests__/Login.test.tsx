import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../lib/api', () => ({
  api: { post: vi.fn() },
}));
vi.mock('../../store/auth');

const mockNavigate = vi.fn();
const mockLocation: { state: any } = { state: null };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';
import { useAuth } from '../../store/auth';
import { api } from '../../lib/api';

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );

describe('Login', () => {
  const mockSetAuth = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (api.post as any).mockReset();
    (useAuth as any).mockReturnValue({ setAuth: mockSetAuth });
    mockLocation.state = null;
  });

  afterEach(() => {
    mockLocation.state = null;
  });

  it('deve renderizar formulário de login', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('deve ter valores padrão nos campos', () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText('Senha') as HTMLInputElement;
    expect(emailInput.value).toBe('admin@cupcakes.dev');
    expect(passwordInput.value).toBe('admin123');
  });

  it('deve permitir alterar valores dos campos', async () => {
    renderLogin();
    const user = userEvent.setup();
    const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText('Senha') as HTMLInputElement;
    await user.clear(emailInput);
    await user.type(emailInput, 'test@example.com');
    await user.clear(passwordInput);
    await user.type(passwordInput, 'newpassword');
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('newpassword');
  });

  it('deve fazer login com sucesso', async () => {
    (api.post as any).mockResolvedValue({
      data: {
        user: { id: '1', name: 'João', email: 'joao@test.com', role: 'CUSTOMER' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      },
    });

    renderLogin();
    const user = userEvent.setup();
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Senha');
    const loginButton = screen.getByRole('button', { name: 'Entrar' });

    await user.clear(emailInput);
    await user.type(emailInput, 'joao@test.com');
    await user.clear(passwordInput);
    await user.type(passwordInput, '123456');
    await user.click(loginButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'joao@test.com',
        password: '123456',
      });
    });

    await waitFor(() => {
      expect(mockSetAuth).toHaveBeenCalledWith({
        user: { id: '1', name: 'João', email: 'joao@test.com', role: 'CUSTOMER' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });

    expect(screen.queryByText('Erro no login')).not.toBeInTheDocument();
  });

  it('deve navegar para página de origem após login', async () => {
    (api.post as any).mockResolvedValue({
      data: {
        user: { id: '1', name: 'João', email: 'joao@test.com', role: 'CUSTOMER' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      },
    });

    mockLocation.state = { from: { pathname: '/cart' } };

    renderLogin();
    const user = userEvent.setup();
    const loginButton = screen.getByRole('button', { name: 'Entrar' });
    await user.click(loginButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'admin@cupcakes.dev',
        password: 'admin123',
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/cart', { replace: true });
    });

    expect(screen.queryByText('Erro no login')).not.toBeInTheDocument();
  });

  it('deve exibir mensagem de erro em caso de falha', async () => {
    const errorMessage = 'Credenciais inválidas';
    (api.post as any).mockRejectedValue({ response: { data: { message: errorMessage } } });

    renderLogin();
    const user = userEvent.setup();
    const loginButton = screen.getByRole('button', { name: 'Entrar' });
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    expect(mockSetAuth).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('deve exibir mensagem de erro genérica quando não há mensagem específica', async () => {
    (api.post as any).mockRejectedValue(new Error('Network error'));

    renderLogin();
    const user = userEvent.setup();
    const loginButton = screen.getByRole('button', { name: 'Entrar' });
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Erro no login')).toBeInTheDocument();
    });
  });

  it('deve limpar mensagem de erro ao tentar novo login', async () => {
    (api.post as any).mockRejectedValue({ response: { data: { message: 'Erro inicial' } } });

    renderLogin();
    const user = userEvent.setup();
    const loginButton = screen.getByRole('button', { name: 'Entrar' });
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Erro inicial')).toBeInTheDocument();
    });
    (api.post as any).mockResolvedValue({
      data: {
        user: { id: '1', name: 'João', email: 'joao@test.com', role: 'CUSTOMER' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      },
    });

    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.queryByText('Erro inicial')).not.toBeInTheDocument();
    });
  });

  it('deve ter link para página de cadastro', () => {
    renderLogin();
    const registerLink = screen.getByText('Cadastre-se');
    expect(registerLink).toHaveAttribute('href', '/register');
  });
});
