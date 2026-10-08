import { defineConfig, devices } from '@playwright/test';

/**
 * playwright.config.ts
 *
 * Configuração do Playwright para testes E2E da aplicação Nordic Nest.
 * Roda em modo headless contra o servidor de dev Vite (porta 5173).
 *
 * Documentação: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Diretório onde ficam os testes E2E (separado dos unit tests do Vitest)
  testDir: './e2e',

  // Cada teste tem até 30s para concluir
  timeout: 30_000,

  // Tempo máximo para o expect aguardar
  expect: { timeout: 8_000 },

  // Executa em paralelo; reporta erros imediatamente
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    // URL base do servidor de desenvolvimento Vite
    baseURL: 'http://localhost:5173',

    // Captura trace em caso de falha (para debug)
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',

    // Headless por padrão; muda para false para depurar visualmente
    headless: true,

    // Viewport consistente
    viewport: { width: 1280, height: 720 },

    // Aguarda navegação completar após cliques
    actionTimeout: 10_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Inicia o servidor de desenvolvimento automaticamente antes dos testes
  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,   // reutiliza o `yarn dev` já em execução
    timeout: 30_000,
  },
});
