import { describe, it, expect } from 'vitest';
import {
  loginFormSchema,
  userSchema,
  authResponseSchema,
} from './authSchema';

describe('authSchema - Zod Schemas e Validação', () => {
  describe('loginFormSchema', () => {
    it('deve validar com sucesso credenciais corretas', () => {
      const validData = {
        email: 'emily.johnson@x.dummyjson.com',
        password: 'emilyspass',
        rememberMe: true,
      };

      const result = loginFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('emily.johnson@x.dummyjson.com');
        expect(result.data.password).toBe('emilyspass');
        expect(result.data.rememberMe).toBe(true);
      }
    });

    it('deve rejeitar e-mail vazio ou inválido', () => {
      const invalidEmail = {
        email: 'email-invalido',
        password: '1234password',
        rememberMe: false,
      };

      const result = loginFormSchema.safeParse(invalidEmail);
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailIssue = result.error.issues.find((issue) => issue.path.includes('email'));
        expect(emailIssue).toBeDefined();
        expect(emailIssue?.message).toContain('e-mail válido');
      }
    });

    it('deve rejeitar senha com menos de 4 caracteres', () => {
      const shortPass = {
        email: 'teste@exemplo.com',
        password: '123',
        rememberMe: true,
      };

      const result = loginFormSchema.safeParse(shortPass);
      expect(result.success).toBe(false);
      if (!result.success) {
        const passIssue = result.error.issues.find((issue) => issue.path.includes('password'));
        expect(passIssue).toBeDefined();
        expect(passIssue?.message).toContain('mínimo 4 caracteres');
      }
    });
  });

  describe('userSchema & authResponseSchema', () => {
    it('deve validar objeto de usuário autenticado retornado pela API', () => {
      const apiUser = {
        id: 1,
        username: 'emilys',
        email: 'emily.johnson@x.dummyjson.com',
        firstName: 'Emily',
        lastName: 'Johnson',
        gender: 'female',
        image: 'https://dummyjson.com/icon/emilys/128',
      };

      const result = userSchema.safeParse(apiUser);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(1);
        expect(result.data.username).toBe('emilys');
      }
    });

    it('deve validar resposta de login contendo tokens JWT', () => {
      const loginPayload = {
        id: 1,
        username: 'emilys',
        email: 'emily.johnson@x.dummyjson.com',
        firstName: 'Emily',
        lastName: 'Johnson',
        accessToken: 'mock-jwt-access-token',
        refreshToken: 'mock-jwt-refresh-token',
      };

      const result = authResponseSchema.safeParse(loginPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.accessToken).toBe('mock-jwt-access-token');
      }
    });
  });
});
