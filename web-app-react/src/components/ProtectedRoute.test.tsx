import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { ProtectedRoute } from './ProtectedRoute';
import { renderWithProviders } from '../test/test-utils';
import * as useAuthHook from '../hooks/useAuth';

describe('ProtectedRoute - Componente de Guarda de Rotas', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('deve exibir indicador de carregamento acessível enquanto isLoading for true', () => {
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      token: null,
      error: null,
      cart: [],
      favorites: [],
      login: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
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
    });

    renderWithProviders(
      <ProtectedRoute>
        <div>Conteúdo Restrito</div>
      </ProtectedRoute>,
      { withAuth: false },
    );

    expect(
      screen.getByText(/verificando credenciais de acesso/i),
    ).toBeInTheDocument();
  });

  it('deve renderizar o conteúdo protegido quando isAuthenticated for true', () => {
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 1,
        username: 'emilys',
        email: 'emily.johnson@x.dummyjson.com',
        firstName: 'Emily',
        lastName: 'Johnson',
      },
      token: 'jwt-valido',
      error: null,
      cart: [],
      favorites: [],
      login: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
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
    });

    renderWithProviders(
      <ProtectedRoute>
        <div>Área Restrita do Membro VIP</div>
      </ProtectedRoute>,
      { withAuth: false },
    );

    expect(
      screen.getByText(/área restrita do membro vip/i),
    ).toBeInTheDocument();
  });

  it('não deve renderizar o conteúdo protegido quando não autenticado', () => {
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      error: null,
      cart: [],
      favorites: [],
      login: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
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
    });

    renderWithProviders(
      <ProtectedRoute>
        <div>Área Restrita do Membro VIP</div>
      </ProtectedRoute>,
      { withAuth: false },
    );

    expect(
      screen.queryByText(/área restrita do membro vip/i),
    ).not.toBeInTheDocument();
  });
});
