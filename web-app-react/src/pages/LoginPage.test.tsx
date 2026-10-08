import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { LoginPage } from './LoginPage';
import { renderWithProviders } from '../test/test-utils';
import * as useAuthHook from '../hooks/useAuth';

// ─── Mock do useAuth ─────────────────────────────────────────────────────────
// Evita que o AuthProvider real monte e dispare GET /auth/me em cada teste,
// eliminando o gargalo de rede por renderização.

const mockLogin = vi.fn();
const mockClearError = vi.fn();

function mockUseAuth(overrides: Partial<ReturnType<typeof useAuthHook.useAuth>> = {}) {
  vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    token: null,
    error: null,
    cart: [],
    favorites: [],
    login: mockLogin,
    logout: vi.fn(),
    clearError: mockClearError,
    addToCart: vi.fn(),
    updateCartQuantity: vi.fn(),
    removeFromCart: vi.fn(),
    clearCart: vi.fn(),
    cartCount: 0,
    cartTotal: 0,
    toggleFavorite: vi.fn(),
    isFavorite: vi.fn(() => false),
    removeFromFavorites: vi.fn(),
    clearFavorites: vi.fn(),
    favoritesCount: 0,
    ...overrides,
  });
}

describe('LoginPage - Testes de Componente e Formulário', () => {
  // userEvent.setup() é chamado UMA vez por teste via renderWithProviders,
  // garantindo que a instância seja reutilizada e não recriada a cada interação.

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('deve renderizar os elementos principais do formulário através de consultas acessíveis', () => {
    mockUseAuth();

    renderWithProviders(<LoginPage />, { withAuth: false });

    // Título e cabeçalho por papel semântico
    expect(
      screen.getByRole('heading', { name: /acesso de membro/i }),
    ).toBeInTheDocument();

    // Inputs com rótulos semânticos
    expect(screen.getByRole('textbox', { name: /e-mail/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();

    // Checkbox de lembrar sessão
    expect(
      screen.getByRole('checkbox', { name: /manter-me conectado/i }),
    ).toBeInTheDocument();

    // Botão de submissão
    expect(
      screen.getByRole('button', { name: /entrar na conta/i }),
    ).toBeInTheDocument();
  });

  it('deve permitir que o usuário digite credenciais com userEvent', async () => {
    mockUseAuth();

    const { user } = renderWithProviders(<LoginPage />, { withAuth: false });

    const emailInput = screen.getByRole('textbox', { name: /e-mail/i });
    const passwordInput = screen.getByLabelText(/senha/i);

    // Limpa e digita valores curtos mas distintos (reduz keystrokes)
    await user.clear(emailInput);
    await user.type(emailInput, 'a@b.co');
    await user.clear(passwordInput);
    await user.type(passwordInput, 'pass');

    expect(emailInput).toHaveValue('a@b.co');
    expect(passwordInput).toHaveValue('pass');
  });

  it('deve exibir mensagem de validação Zod quando o e-mail for inválido', async () => {
    mockUseAuth();

    const { user } = renderWithProviders(<LoginPage />, { withAuth: false });

    const emailInput = screen.getByRole('textbox', { name: /e-mail/i });
    const submitButton = screen.getByRole('button', { name: /entrar na conta/i });

    // Valor mínimo que dispara erro de formato (sem @)
    await user.clear(emailInput);
    await user.type(emailInput, 'abc');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/por favor, insira um e-mail válido/i),
      ).toBeInTheDocument();
    });
  });

  it('deve exibir mensagem de validação Zod quando a senha for muito curta', async () => {
    mockUseAuth();

    const { user } = renderWithProviders(<LoginPage />, { withAuth: false });

    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar na conta/i });

    await user.clear(passwordInput);
    await user.type(passwordInput, '12');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/a senha deve conter no mínimo 4 caracteres/i),
      ).toBeInTheDocument();
    });
  });

  it('deve preencher credenciais de teste ao clicar nos botões de demonstração rápida', async () => {
    mockUseAuth();

    const { user } = renderWithProviders(<LoginPage />, { withAuth: false });

    const demoButton = screen.getByRole('button', {
      name: /emily johnson \(designer chefe\)/i,
    });
    await user.click(demoButton);

    const emailInput = screen.getByRole('textbox', { name: /e-mail/i });
    const passwordInput = screen.getByLabelText(/senha/i);

    expect(emailInput).toHaveValue('emily.johnson@x.dummyjson.com');
    expect(passwordInput).toHaveValue('emilyspass');
  });
});
