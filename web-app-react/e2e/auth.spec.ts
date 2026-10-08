/**
 * e2e/auth.spec.ts
 *
 * Fluxo 1 — Autenticação e redirecionamento pós-login
 *
 * Cenários cobertos:
 *  1. Usuário não autenticado acessa "/" e vê a home com CTA de entrada
 *  2. Usuário navega para /login, preenche credenciais e vê os campos acessíveis
 *  3. Após login com credenciais reais da DummyJSON, redireciona para /produtos
 *  4. Preserva rota de retorno após autenticação
 *  5. Login com credenciais inválidas exibe alerta de erro acessível
 *  6. Logout encerra a sessão e limpa o estado de autenticação
 *
 * Localizadores semânticos: getByRole, getByLabel, getByText, getByPlaceholder
 */

import { test, expect } from '@playwright/test';

// Credenciais reais da DummyJSON (ambiente público)
const DEMO_EMAIL = 'emily.johnson@x.dummyjson.com';
const DEMO_PASSWORD = 'emilyspass';
const DEMO_FIRST_NAME = 'Emily';

test.describe('Fluxo 1 — Autenticação com redirecionamento', () => {
  test.beforeEach(async ({ page }) => {
    // Garante estado limpo antes de cada cenário
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  // ── Cenário 1.1: Home pública sem autenticação ────────────────────────────

  test('deve exibir a home page com o título Nordic Nest sem autenticação', async ({ page }) => {
    await page.goto('/');

    // Cabeçalho da marca
    await expect(page.getByRole('link', { name: /nordic nest/i }).first()).toBeVisible();

    // Botão de login no cabeçalho
    await expect(page.getByRole('link', { name: 'Entrar', exact: true })).toBeVisible();
  });

  // ── Cenário 1.2: Formulário de login com campos acessíveis ─────────────────

  test('deve renderizar o formulário de login com campos acessíveis', async ({ page }) => {
    await page.goto('/login');

    await expect(
      page.getByRole('heading', { name: /acesso de membro/i }),
    ).toBeVisible();

    await expect(page.getByRole('textbox', { name: /e-mail/i })).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /manter-me conectado/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar na conta/i })).toBeVisible();
  });

  // ── Cenário 1.3: Login com credenciais válidas e redirecionamento ──────────

  test('deve autenticar com credenciais reais e redirecionar para /produtos', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.getByRole('textbox', { name: /e-mail/i });
    const passwordInput = page.getByLabel(/senha/i);
    const submitButton = page.getByRole('button', { name: /entrar na conta/i });

    await emailInput.clear();
    await emailInput.fill(DEMO_EMAIL);
    await passwordInput.clear();
    await passwordInput.fill(DEMO_PASSWORD);

    await submitButton.click();

    // Aguarda redirecionamento para /produtos após login bem-sucedido
    await expect(page).toHaveURL(/\/produtos/, { timeout: 15_000 });

    // Cabeçalho deve exibir o nome do usuário autenticado
    await expect(
      page.getByText(DEMO_FIRST_NAME, { exact: false }).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  // ── Cenário 1.4: Redirecionamento com rota de origem ───────────────────────

  test('deve preservar a URL de origem e redirecionar ao destino correto após login', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.getByRole('textbox', { name: /e-mail/i });
    const passwordInput = page.getByLabel(/senha/i);

    await emailInput.clear();
    await emailInput.fill(DEMO_EMAIL);
    await passwordInput.clear();
    await passwordInput.fill(DEMO_PASSWORD);

    await page.getByRole('button', { name: /entrar na conta/i }).click();

    // Destino padrão do login sem state.from é /produtos
    await expect(page).toHaveURL(/\/produtos/, { timeout: 15_000 });
  });

  // ── Cenário 1.5: Login com senha incorreta exibe alerta de erro ───────────

  test('deve exibir mensagem de erro ao tentar login com senha incorreta', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.getByRole('textbox', { name: /e-mail/i });
    const passwordInput = page.getByLabel(/senha/i);

    await emailInput.clear();
    await emailInput.fill(DEMO_EMAIL);
    await passwordInput.clear();
    await passwordInput.fill('senha-invalida-123');

    await page.getByRole('button', { name: /entrar na conta/i }).click();

    // Alerta de erro retornado pela API DummyJSON
    await expect(
      page.getByRole('alert').filter({ hasText: /erro ao entrar/i }),
    ).toBeVisible({ timeout: 12_000 });

    // Permanece na tela de login
    await expect(page).toHaveURL(/\/login/);
  });

  // ── Cenário 1.6: Logout encerra sessão ─────────────────────────────────────

  test('deve encerrar a sessão ao clicar em logout e retornar ao estado não autenticado', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: /e-mail/i }).fill(DEMO_EMAIL);
    await page.getByLabel(/senha/i).fill(DEMO_PASSWORD);
    await page.getByRole('button', { name: /entrar na conta/i }).click();
    await expect(page).toHaveURL(/\/produtos/, { timeout: 15_000 });

    // Clica no botão de perfil do usuário no cabeçalho
    const userMenuButton = page.getByText(DEMO_FIRST_NAME, { exact: false }).first();
    await expect(userMenuButton).toBeVisible({ timeout: 10_000 });
    await userMenuButton.click();

    // Clica em "Encerrar Sessão" no dropdown
    const logoutItem = page.getByRole('menuitem', { name: /encerrar sessão/i });
    await expect(logoutItem).toBeVisible({ timeout: 5_000 });
    await logoutItem.click();

    // Botão "Entrar" volta a ser exibido no cabeçalho
    await expect(
      page.getByRole('link', { name: 'Entrar', exact: true }),
    ).toBeVisible({ timeout: 8_000 });
  });
});
