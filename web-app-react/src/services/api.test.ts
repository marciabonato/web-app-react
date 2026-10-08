import { describe, it, expect, beforeEach, vi } from 'vitest';
import api, {
  ApiError,
  saveToken,
  clearToken,
} from './api';

describe('src/services/api.ts - Axios Centralizado e Interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('deve possuir a baseURL configurada para a API DummyJSON', () => {
    expect(api.defaults.baseURL).toBe('https://dummyjson.com');
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  describe('Helpers de Token (saveToken, clearToken)', () => {
    it('deve salvar o token no sessionStorage por padrão (sessão efêmera)', () => {
      saveToken('token-efemero-123', false);
      expect(sessionStorage.getItem('auth_token')).toBe('token-efemero-123');
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('deve salvar o token no localStorage quando persist for true (lembrar-me)', () => {
      saveToken('token-persistente-456', true);
      expect(localStorage.getItem('auth_token')).toBe('token-persistente-456');
    });

    it('deve remover o token de ambos os storages no clearToken', () => {
      localStorage.setItem('auth_token', 'token-local');
      sessionStorage.setItem('auth_token', 'token-session');

      clearToken();

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(sessionStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('Classe ApiError', () => {
    it('deve encapsular a mensagem amigável e o status HTTP', () => {
      const originalErr = new Error('Falha original');
      const apiErr = new ApiError('Mensagem em Português para o usuário', 404, originalErr);

      expect(apiErr.name).toBe('ApiError');
      expect(apiErr.userMessage).toBe('Mensagem em Português para o usuário');
      expect(apiErr.status).toBe(404);
      expect(apiErr.message).toBe('Mensagem em Português para o usuário');
    });
  });
});
