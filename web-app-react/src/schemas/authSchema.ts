/**
 * src/schemas/authSchema.ts
 *
 * Schemas Zod para autenticação (formulário de login e resposta da API DummyJSON).
 * Os tipos TypeScript são inferidos automaticamente via `z.infer`.
 */

import { z } from 'zod';

// ─── Schema de Validação do Formulário de Login ─────────────────────────────────

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Por favor, informe seu endereço de e-mail.')
    .email('Por favor, insira um e-mail válido (ex: seu.nome@dominio.com).'),
  password: z
    .string()
    .min(1, 'Por favor, insira sua senha de acesso.')
    .min(4, 'A senha deve conter no mínimo 4 caracteres.'),
  rememberMe: z.boolean().default(true),
});

/** Tipo inferido do formulário de login via z.infer */
export type LoginFormValues = z.infer<typeof loginFormSchema>;

// ─── Schema do Usuário Autenticado ──────────────────────────────────────────────

export const userSchema = z.object({
  id: z.number().int().positive(),
  username: z.string().min(1),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  gender: z.string().optional(),
  image: z.string().optional(),
});

/** Tipo inferido do usuário via z.infer */
export type User = z.infer<typeof userSchema>;

// ─── Schema da Resposta de Login DummyJSON (/auth/login) ─────────────────────────

export const authResponseSchema = userSchema.extend({
  accessToken: z.string().optional(),
  token: z.string().optional(),
  refreshToken: z.string().optional(),
});

/** Tipo inferido da resposta de login via z.infer */
export type AuthResponse = z.infer<typeof authResponseSchema>;
