/**
 * src/contexts/AuthContext.tsx
 *
 * Gerenciador de estado global de autenticação com React Context API.
 * Controla os dados do usuário autenticado, token JWT e status de carregamento,
 * garantindo a imutabilidade do estado com spreads (...).
 *
 * Consome o endpoint POST /auth/login e GET /auth/me da DummyJSON via Axios centralizado.
 */

import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import api, { ApiError, saveToken, clearToken } from '../services/api';
import type { Product } from '../schemas/productSchema';
import { userSchema, authResponseSchema, type User } from '../schemas/authSchema';

// ─── Tipos e Interfaces ─────────────────────────────────────────────────────────

export type { User };

export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
  expiresInMins?: number;
  rememberMe?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  cart: CartItem[];
  favorites: Product[];
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: number) => boolean;
  removeFromFavorites: (productId: number) => void;
  clearFavorites: () => void;
  favoritesCount: number;
}

// ─── Mapeamento de E-mails para Usuários DummyJSON ─────────────────────────────

const EMAIL_TO_USERNAME_MAP: Record<string, string> = {
  'emily.johnson@x.dummyjson.com': 'emilys',
  'emilys@nordicnest.com': 'emilys',
  'michael.williams@x.dummyjson.com': 'michaelw',
  'sophia.brown@x.dummyjson.com': 'sophiab',
  'james.davis@x.dummyjson.com': 'jamesd',
  'emma.miller@x.dummyjson.com': 'emmaj',
};

// ─── Criação do Contexto ────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Chaves de Armazenamento Local ──────────────────────────────────────────────

const USER_STORAGE_KEY = 'auth_user';
const TOKEN_STORAGE_KEY = 'auth_token';
const CART_STORAGE_KEY = 'nordic_cart';
const FAVORITES_STORAGE_KEY = 'nordic_favorites';

// ─── Provedor de Autenticação (AuthProvider) ───────────────────────────────────

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => {
    const savedToken =
      localStorage.getItem(TOKEN_STORAGE_KEY) ??
      sessionStorage.getItem(TOKEN_STORAGE_KEY);
    const savedUserJson = localStorage.getItem(USER_STORAGE_KEY);
    const savedCartJson = localStorage.getItem(CART_STORAGE_KEY);
    const savedFavoritesJson = localStorage.getItem(FAVORITES_STORAGE_KEY);

    let savedUser: User | null = null;
    if (savedUserJson) {
      try {
        savedUser = JSON.parse(savedUserJson) as User;
      } catch {
        savedUser = null;
      }
    }

    let savedCart: CartItem[] = [];
    if (savedCartJson) {
      try {
        savedCart = JSON.parse(savedCartJson) as CartItem[];
      } catch {
        savedCart = [];
      }
    }

    let savedFavorites: Product[] = [];
    if (savedFavoritesJson) {
      try {
        savedFavorites = JSON.parse(savedFavoritesJson) as Product[];
      } catch {
        savedFavorites = [];
      }
    }

    return {
      user: savedUser ? { ...savedUser } : null,
      token: savedToken ?? null,
      isAuthenticated: Boolean(savedToken),
      isLoading: true,
      error: null,
      cart: [...savedCart],
      favorites: [...savedFavorites],
    };
  });

  // Função de logout com limpeza de estado imutável
  const logout = useCallback((): void => {
    clearToken();
    localStorage.removeItem(USER_STORAGE_KEY);

    setState((prevState) => ({
      ...prevState,
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    }));
  }, []);

  // Limpa erros residuais da sessão
  const clearError = useCallback((): void => {
    setState((prevState) => ({
      ...prevState,
      error: null,
    }));
  }, []);

  // Operações imutáveis do Carrinho / Sacola
  const addToCart = useCallback((product: Product, quantity = 1): void => {
    setState((prevState) => {
      const existingIndex = prevState.cart.findIndex((item) => item.product.id === product.id);
      let updatedCart: CartItem[];

      if (existingIndex >= 0) {
        updatedCart = prevState.cart.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : { ...item },
        );
      } else {
        updatedCart = [...prevState.cart, { product: { ...product }, quantity }];
      }

      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
      } catch {
        // Ignora erro de storage
      }

      return {
        ...prevState,
        cart: updatedCart,
      };
    });
  }, []);

  const removeFromCart = useCallback((productId: number): void => {
    setState((prevState) => {
      const updatedCart = prevState.cart.filter((item) => item.product.id !== productId);
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
      } catch {
        // Ignora erro de storage
      }
      return {
        ...prevState,
        cart: updatedCart,
      };
    });
  }, []);

  const updateCartQuantity = useCallback((productId: number, quantity: number): void => {
    setState((prevState) => {
      const updatedCart = prevState.cart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(0, quantity) }
          : { ...item },
      ).filter((item) => item.quantity > 0);
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
      } catch {
        // Ignora erro de storage
      }
      return {
        ...prevState,
        cart: updatedCart,
      };
    });
  }, []);

  const clearCart = useCallback((): void => {
    setState((prevState) => {
      localStorage.removeItem(CART_STORAGE_KEY);
      return {
        ...prevState,
        cart: [],
      };
    });
  }, []);

  // Operações imutáveis de Favoritos / Lista de Desejos
  const toggleFavorite = useCallback((product: Product): void => {
    setState((prevState) => {
      const exists = prevState.favorites.some((fav) => fav.id === product.id);
      const updatedFavorites = exists
        ? prevState.favorites.filter((fav) => fav.id !== product.id)
        : [...prevState.favorites, { ...product }];

      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavorites));
      } catch {
        // Ignora erro de storage
      }

      return {
        ...prevState,
        favorites: updatedFavorites,
      };
    });
  }, []);

  const isFavorite = useCallback(
    (productId: number): boolean => {
      return state.favorites.some((fav) => fav.id === productId);
    },
    [state.favorites],
  );

  const removeFromFavorites = useCallback((productId: number): void => {
    setState((prevState) => {
      const updatedFavorites = prevState.favorites.filter((fav) => fav.id !== productId);
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavorites));
      } catch {
        // Ignora erro de storage
      }
      return {
        ...prevState,
        favorites: updatedFavorites,
      };
    });
  }, []);

  const clearFavorites = useCallback((): void => {
    setState((prevState) => {
      localStorage.removeItem(FAVORITES_STORAGE_KEY);
      return {
        ...prevState,
        favorites: [],
      };
    });
  }, []);

  // Login: resolve email/username e envia credenciais para POST /auth/login da DummyJSON
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      setState((prevState) => ({
        ...prevState,
        isLoading: true,
        error: null,
      }));

      // Resolução inteligente de e-mail para o username aceito pela DummyJSON
      const rawInput = (credentials.email || credentials.username || '').trim().toLowerCase();
      const resolvedUsername =
        EMAIL_TO_USERNAME_MAP[rawInput] ||
        (rawInput.includes('@') ? rawInput.split('@')[0] : rawInput) ||
        'emilys';

      try {
        const response = await api.post<unknown>('/auth/login', {
          username: resolvedUsername,
          password: credentials.password.trim(),
          expiresInMins: credentials.expiresInMins ?? 60,
        });

        const parsed = authResponseSchema.safeParse(response.data);

        if (!parsed.success) {
          throw new Error('Resposta de autenticação com formato inválido retornado pelo servidor.');
        }

        const authData = parsed.data;
        const token = authData.accessToken ?? authData.token;

        if (!token) {
          throw new Error('Token JWT não foi retornado pelo servidor.');
        }

        const authenticatedUser: User = {
          id: authData.id,
          username: authData.username,
          email: authData.email,
          firstName: authData.firstName,
          lastName: authData.lastName,
          gender: authData.gender,
          image: authData.image,
        };

        const remember = credentials.rememberMe ?? true;
        saveToken(token, remember);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authenticatedUser));

        setState((prevState) => ({
          ...prevState,
          user: { ...authenticatedUser },
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }));
      } catch (err: unknown) {
        let errorMessage = 'E-mail ou senha incorretos. Verifique suas credenciais.';

        if (err instanceof ApiError) {
          errorMessage = err.userMessage;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          error: errorMessage,
        }));

        throw err;
      }
    },
    [],
  );

  // Efeito de inicialização: valida o token salvo buscando dados atualizados em GET /auth/me
  useEffect(() => {
    const controller = new AbortController();

    async function restoreSession(): Promise<void> {
      const storedToken =
        localStorage.getItem(TOKEN_STORAGE_KEY) ??
        sessionStorage.getItem(TOKEN_STORAGE_KEY);

      if (!storedToken) {
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          isAuthenticated: false,
          user: null,
          token: null,
        }));
        return;
      }

      try {
        const response = await api.get<unknown>('/auth/me', {
          signal: controller.signal,
        });

        const parsed = userSchema.safeParse(response.data);

        if (!parsed.success) {
          throw new Error('Dados do perfil inválidos retornados pela API.');
        }

        const refreshedUser: User = {
          id: parsed.data.id,
          username: parsed.data.username,
          email: parsed.data.email,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          gender: parsed.data.gender,
          image: parsed.data.image,
        };

        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(refreshedUser));

        setState((prevState) => ({
          ...prevState,
          user: { ...refreshedUser },
          token: storedToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }));
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        logout();
      }
    }

    void restoreSession();

    const handleUnauthorizedEvent = (): void => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorizedEvent);

    return () => {
      controller.abort();
      window.removeEventListener('auth:unauthorized', handleUnauthorizedEvent);
    };
  }, [logout]);

  // Cálculos derivados da Sacola e Favoritos
  const cartCount = useMemo(
    () => state.cart.reduce((total, item) => total + item.quantity, 0),
    [state.cart],
  );

  const cartTotal = useMemo(
    () => state.cart.reduce((total, item) => total + item.product.price * item.quantity, 0),
    [state.cart],
  );

  const favoritesCount = useMemo(
    () => state.favorites.length,
    [state.favorites],
  );

  const contextValue = useMemo<AuthContextType>(
    () => ({
      ...state,
      login,
      logout,
      clearError,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      cartCount,
      cartTotal,
      toggleFavorite,
      isFavorite,
      removeFromFavorites,
      clearFavorites,
      favoritesCount,
    }),
    [
      state,
      login,
      logout,
      clearError,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      cartCount,
      cartTotal,
      toggleFavorite,
      isFavorite,
      removeFromFavorites,
      clearFavorites,
      favoritesCount,
    ],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
